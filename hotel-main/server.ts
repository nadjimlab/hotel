import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getDb, getEngineName, query } from './src/db/index.ts';
import { runMigrations } from './src/db/migrate.ts';
import { runSeed } from './src/db/seed.ts';
import { login, registerGuest, verifyToken } from './src/services/authService.ts';
import { searchAvailability } from './src/services/availabilityService.ts';
import { createBooking } from './src/services/bookingService.ts';
import { generateUuid } from './src/utils/crypto.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logger for API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// Middleware for auth verification
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé : jeton d\'accès manquant.' });
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Jeton de session invalide ou expiré.' });
  }

  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  authenticate(req, res, () => {
    const user = (req as any).user;
    if (user?.role !== 'admin' && user?.role !== 'staff') {
      return res.status(403).json({ error: 'Accès refusé. Privilèges administratifs requis.' });
    }
    next();
  });
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// System Health & Database Status
app.get('/api/health', async (req, res) => {
  try {
    const db = await getDb();
    const testRes = await query('SELECT 1 as connected');
    const tableRes = await query(`
      SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public'
    `);
    const reservationsCount = await query('SELECT count(*) as count FROM reservations');

    res.json({
      status: 'operational',
      resort: "La Gazelle d'Or Resort & Spa",
      location: 'El Oued, Algeria',
      database: {
        connected: testRes.rows.length > 0,
        engine: db.engine,
        publicTablesCount: parseInt(tableRes.rows[0]?.count || '0', 10),
        totalReservationsInDb: parseInt(reservationsCount.rows[0]?.count || '0', 10),
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Erreur de connexion à la base de données',
      error: error.message,
    });
  }
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }
    const result = await login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Échec de la connexion.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis.' });
    }
    const result = await registerGuest(name, email, password);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

// Accommodations / Rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const roomsRes = await query(`
      SELECT r.*, rt.code as type_code, rt.name_fr as type_name_fr
      FROM rooms r
      JOIN room_types rt ON r.type_id = rt.id
      WHERE r.is_active = true
      ORDER BY r.base_price_dzd ASC
    `);

    const rooms = [];
    for (const r of roomsRes.rows) {
      const imgRes = await query<{ url: string }>(
        'SELECT url FROM room_images WHERE room_id = $1 ORDER BY display_order ASC',
        [r.id]
      );
      const amenRes = await query(
        `SELECT a.code, a.name_fr, a.name_ar, a.name_en, a.icon_name
         FROM amenities a
         JOIN room_amenities ra ON a.id = ra.amenity_id
         WHERE ra.room_id = $1`,
        [r.id]
      );

      rooms.push({
        ...r,
        base_price_dzd: parseFloat(r.base_price_dzd),
        images: imgRes.rows.map((img) => img.url),
        amenities: amenRes.rows,
      });
    }

    res.json({ rooms });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const roomRes = await query(
      `SELECT r.*, rt.code as type_code, rt.name_fr as type_name_fr
       FROM rooms r
       JOIN room_types rt ON r.type_id = rt.id
       WHERE r.slug = $1 AND r.is_active = true`,
      [slug]
    );

    if (roomRes.rows.length === 0) {
      return res.status(404).json({ error: 'Hébergement non trouvé.' });
    }

    const r = roomRes.rows[0];
    const imgRes = await query<{ url: string }>(
      'SELECT url FROM room_images WHERE room_id = $1 ORDER BY display_order ASC',
      [r.id]
    );
    const amenRes = await query(
      `SELECT a.code, a.name_fr, a.name_ar, a.name_en, a.icon_name
       FROM amenities a
       JOIN room_amenities ra ON a.id = ra.amenity_id
       WHERE ra.room_id = $1`,
      [r.id]
    );

    res.json({
      ...r,
      base_price_dzd: parseFloat(r.base_price_dzd),
      images: imgRes.rows.map((img) => img.url),
      amenities: amenRes.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Real-Time Availability & Server-Computed Pricing
app.get('/api/availability', async (req, res) => {
  try {
    const { checkIn, checkOut, adults, children, roomSlug } = req.query;
    const result = await searchAvailability({
      checkIn: String(checkIn || ''),
      checkOut: String(checkOut || ''),
      adults: adults ? parseInt(String(adults), 10) : 2,
      children: children ? parseInt(String(children), 10) : 0,
      roomSlug: roomSlug ? String(roomSlug) : undefined,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Additional Services (Spa, Excursions, Transfers, Dining)
app.get('/api/services', async (req, res) => {
  try {
    const servicesRes = await query(`
      SELECT * FROM services WHERE is_active = true ORDER BY category, price_dzd ASC
    `);
    res.json({
      services: servicesRes.rows.map((s) => ({
        ...s,
        price_dzd: parseFloat(s.price_dzd),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Reservation (POST /api/reservations)
// Executes transactional PostgreSQL booking with SELECT FOR UPDATE lock
app.post('/api/reservations', async (req, res) => {
  try {
    const booking = await createBooking(req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({
      error: error.message || 'Une erreur est survenue lors de la création de la réservation.',
      code: error.code || 'BOOKING_FAILED',
    });
  }
});

// Guest Reservation Lookup (GET /api/reservations/lookup?bookingNumber=...&email=...)
app.get('/api/reservations/lookup', async (req, res) => {
  try {
    const { bookingNumber, email } = req.query;
    if (!bookingNumber || !email) {
      return res.status(400).json({ error: 'Veuillez renseigner le numéro de réservation et l\'adresse email.' });
    }

    const bRes = await query(`
      SELECT 
        r.*,
        g.first_name, g.last_name, g.email as guest_email, g.phone as guest_phone, g.country as guest_country,
        rm.name_fr as room_name_fr, rm.name_ar as room_name_ar, rm.name_en as room_name_en, rm.slug as room_slug,
        p.method as payment_method, p.status as payment_status, p.transaction_ref, p.is_simulator
      FROM reservations r
      JOIN guests g ON r.guest_id = g.id
      JOIN rooms rm ON r.room_id = rm.id
      LEFT JOIN payments p ON p.reservation_id = r.id
      WHERE UPPER(r.booking_number) = UPPER($1) 
        AND LOWER(g.email) = LOWER($2)
    `, [String(bookingNumber).trim(), String(email).trim()]);

    if (bRes.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune réservation correspondante n\'a été trouvée.' });
    }

    const reservation = bRes.rows[0];

    // Fetch services
    const sRes = await query(`
      SELECT rs.quantity, rs.unit_price_dzd, rs.total_dzd, s.name_fr, s.name_ar, s.name_en
      FROM reservation_services rs
      JOIN services s ON rs.service_id = s.id
      WHERE rs.reservation_id = $1
    `, [reservation.id]);

    res.json({
      reservation: {
        id: reservation.id,
        bookingNumber: reservation.booking_number,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        adults: reservation.adults,
        children: reservation.children,
        status: reservation.status,
        specialRequests: reservation.special_requests,
        arrivalTime: reservation.arrival_time,
        roomTotalDzd: parseFloat(reservation.room_total_dzd),
        servicesTotalDzd: parseFloat(reservation.services_total_dzd),
        taxesDzd: parseFloat(reservation.taxes_dzd),
        grandTotalDzd: parseFloat(reservation.grand_total_dzd),
        createdAt: reservation.created_at,
        guest: {
          firstName: reservation.first_name,
          lastName: reservation.last_name,
          email: reservation.guest_email,
          phone: reservation.guest_phone,
          country: reservation.guest_country,
        },
        room: {
          slug: reservation.room_slug,
          name_fr: reservation.room_name_fr,
          name_ar: reservation.room_name_ar,
          name_en: reservation.room_name_en,
        },
        services: sRes.rows.map((s) => ({
          name_fr: s.name_fr,
          name_ar: s.name_ar,
          name_en: s.name_en,
          quantity: s.quantity,
          unitPriceDzd: parseFloat(s.unit_price_dzd),
          totalDzd: parseFloat(s.total_dzd),
        })),
        payment: {
          method: reservation.payment_method,
          status: reservation.payment_status,
          transactionRef: reservation.transaction_ref,
          isSimulator: reservation.is_simulator,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Guest Cancellation Request (POST /api/reservations/:bookingNumber/cancel)
app.post('/api/reservations/:bookingNumber/cancel', async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const { email, reason } = req.body;

    const bRes = await query(`
      SELECT r.id, r.status, g.email
      FROM reservations r
      JOIN guests g ON r.guest_id = g.id
      WHERE UPPER(r.booking_number) = UPPER($1)
    `, [bookingNumber.trim()]);

    if (bRes.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }

    const reservation = bRes.rows[0];
    if (email && reservation.email.toLowerCase() !== email.toLowerCase().trim()) {
      return res.status(403).json({ error: 'L\'email fourni ne correspond pas au titulaire de la réservation.' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'Cette réservation est déjà annulée.' });
    }

    await query(`
      UPDATE reservations 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [reservation.id]);

    await query(`
      INSERT INTO audit_logs (id, actor_email, action, entity, entity_id, details)
      VALUES ($1, $2, 'RESERVATION_CANCELLED', 'reservation', $3, $4)
    `, [generateUuid(), email || 'guest', bookingNumber, JSON.stringify({ reason })]);

    res.json({
      success: true,
      message: 'Votre réservation a été annulée avec succès. L\'hébergement a été libéré dans notre inventaire.',
      bookingNumber,
      status: 'cancelled',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ADMIN & PMS BACK-OFFICE ROUTES
// -------------------------------------------------------------

// Admin Dashboard KPIs
app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const todayArrivals = await query(`
      SELECT count(*) as count FROM reservations 
      WHERE check_in = $1 AND status IN ('confirmed', 'checked_in')
    `, [todayStr]);

    const todayDepartures = await query(`
      SELECT count(*) as count FROM reservations 
      WHERE check_out = $1 AND status IN ('confirmed', 'checked_in')
    `, [todayStr]);

    const activeReservations = await query(`
      SELECT count(*) as count FROM reservations 
      WHERE status IN ('confirmed', 'checked_in')
    `);

    const pendingReservations = await query(`
      SELECT count(*) as count FROM reservations WHERE status = 'pending'
    `);

    const cancelledCount = await query(`
      SELECT count(*) as count FROM reservations WHERE status = 'cancelled'
    `);

    const revenueRes = await query(`
      SELECT COALESCE(SUM(grand_total_dzd), 0) as total_revenue
      FROM reservations
      WHERE status NOT IN ('cancelled', 'expired', 'no_show')
    `);

    const totalRoomsRes = await query('SELECT COALESCE(SUM(total_units), 0) as total_rooms FROM rooms WHERE is_active = true');
    const totalRooms = parseInt(totalRoomsRes.rows[0]?.total_rooms || '1', 10);
    const occupiedCount = parseInt(activeReservations.rows[0]?.count || '0', 10);
    const occupancyRate = Math.min(100, Math.round((occupiedCount / Math.max(1, totalRooms)) * 100));

    res.json({
      todayArrivals: parseInt(todayArrivals.rows[0]?.count || '0', 10),
      todayDepartures: parseInt(todayDepartures.rows[0]?.count || '0', 10),
      activeReservations: occupiedCount,
      pendingReservations: parseInt(pendingReservations.rows[0]?.count || '0', 10),
      cancelledReservations: parseInt(cancelledCount.rows[0]?.count || '0', 10),
      occupancyRate,
      totalRevenueDzd: parseFloat(revenueRes.rows[0]?.total_revenue || '0'),
      totalRoomsInventory: totalRooms,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Reservations List & Filter
app.get('/api/admin/reservations', requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;

    let sql = `
      SELECT 
        r.*,
        g.first_name, g.last_name, g.email as guest_email, g.phone as guest_phone, g.country as guest_country,
        rm.name_fr as room_name_fr, rm.slug as room_slug,
        p.method as payment_method, p.status as payment_status
      FROM reservations r
      JOIN guests g ON r.guest_id = g.id
      JOIN rooms rm ON r.room_id = rm.id
      LEFT JOIN payments p ON p.reservation_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND r.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${String(search).trim()}%`);
      sql += ` AND (
        UPPER(r.booking_number) LIKE UPPER($${params.length}) 
        OR UPPER(g.first_name) LIKE UPPER($${params.length}) 
        OR UPPER(g.last_name) LIKE UPPER($${params.length}) 
        OR LOWER(g.email) LIKE LOWER($${params.length})
      )`;
    }

    sql += ' ORDER BY r.created_at DESC LIMIT 100';

    const result = await query(sql, params);
    res.json({ reservations: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Update Reservation Status (check-in, check-out, cancel, add notes)
app.patch('/api/admin/reservations/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalNotes } = req.body;
    const user = (req as any).user;

    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const params: any[] = [id];

    if (status) {
      params.push(status);
      fields.push(`status = $${params.length}`);
    }

    if (internalNotes !== undefined) {
      params.push(internalNotes);
      fields.push(`internal_notes = $${params.length}`);
    }

    const updateSql = `
      UPDATE reservations 
      SET ${fields.join(', ')} 
      WHERE id = $1 
      RETURNING *;
    `;
    const updated = await query(updateSql, params);

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée.' });
    }

    await query(`
      INSERT INTO audit_logs (id, actor_email, action, entity, entity_id, details)
      VALUES ($1, $2, 'ADMIN_RESERVATION_UPDATE', 'reservation', $3, $4)
    `, [generateUuid(), user.email, id, JSON.stringify({ status, internalNotes })]);

    res.json({ reservation: updated.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Reports (Occupancy, Revenue, CSV export)
app.get('/api/admin/reports', requireAdmin, async (req, res) => {
  try {
    const revenueByMonth = await query(`
      SELECT 
        TO_CHAR(check_in, 'YYYY-MM') as month,
        COUNT(*) as reservations_count,
        SUM(grand_total_dzd) as total_revenue
      FROM reservations
      WHERE status NOT IN ('cancelled', 'expired', 'no_show')
      GROUP BY TO_CHAR(check_in, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `);

    const roomPerformance = await query(`
      SELECT 
        rm.name_fr,
        COUNT(r.id) as bookings_count,
        COALESCE(SUM(r.room_total_dzd), 0) as room_revenue
      FROM rooms rm
      LEFT JOIN reservations r ON rm.id = r.room_id AND r.status NOT IN ('cancelled', 'expired', 'no_show')
      GROUP BY rm.id, rm.name_fr
      ORDER BY room_revenue DESC
    `);

    res.json({
      revenueByMonth: revenueByMonth.rows,
      roomPerformance: roomPerformance.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, async (req, res) => {
  try {
    const logsRes = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50');
    res.json({ logs: logsRes.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// VITE CLIENT MIDDLEWARE & STATIC ASSET SERVING
// -------------------------------------------------------------
async function bootstrapServer() {
  // Ensure database migrations and initial seed are executed
  try {
    console.log('⚡ Initializing La Gazelle d\'Or PostgreSQL backend...');
    await runMigrations();
    await runSeed();
    console.log('✅ PostgreSQL database ready and seeded!');
  } catch (err) {
    console.error('⚠️ Database setup warning (will continue):', err);
  }

  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite in dev mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🏨 La Gazelle d'Or Resort & Spa server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 DB Engine in use: ${getEngineName()}`);
  });
}

bootstrapServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
