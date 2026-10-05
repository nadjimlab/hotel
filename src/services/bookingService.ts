import { DbClient, transaction } from '../db/index.ts';
import { generateBookingNumber, generateUuid } from '../utils/crypto.ts';
import { getPaymentProvider } from './paymentService.ts';

export interface CreateBookingInput {
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  services?: Array<{
    serviceId: string;
    quantity: number;
  }>;
  paymentMethod: 'arrival' | 'cib' | 'edahabia' | 'card';
  specialRequests?: string;
  arrivalTime?: string;
}

export interface BookingResponse {
  id: string;
  bookingNumber: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  status: string;
  roomTotalDzd: number;
  servicesTotalDzd: number;
  taxesDzd: number;
  grandTotalDzd: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  selectedServices: Array<{
    name: string;
    quantity: number;
    totalDzd: number;
  }>;
  payment: {
    method: string;
    status: string;
    transactionRef: string;
    isSimulator: boolean;
    message: string;
  };
  createdAt: string;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingResponse> {
  const {
    roomId,
    checkIn,
    checkOut,
    adults = 2,
    children = 0,
    guest,
    services = [],
    paymentMethod = 'arrival',
    specialRequests = '',
    arrivalTime = '',
  } = input;

  // 1. Basic Input Validation
  if (!roomId) {
    throw new Error('Identifiant d\'hébergement manquant.');
  }

  if (!guest?.firstName || !guest?.lastName || !guest?.email || !guest?.phone) {
    throw new Error('Veuillez renseigner toutes les informations client obligatoires (Nom, Prénom, Email, Téléphone).');
  }

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
    throw new Error('Format de date invalide (AAAA-MM-JJ attendu).');
  }

  if (inDate >= outDate) {
    throw new Error('La date de départ doit être strictement postérieure à la date d\'arrivée.');
  }

  const diffDays = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  const nights = Math.max(1, diffDays);

  // Execute entire booking sequence in an ACID PostgreSQL transaction
  return await transaction(async (tx: DbClient) => {
    // 2. Lock the room row to serialize concurrent reservations for this room (SELECT FOR UPDATE)
    const roomRes = await tx.query<{
      id: string;
      slug: string;
      name_fr: string;
      name_ar: string;
      name_en: string;
      max_adults: number;
      max_children: number;
      base_price_dzd: string;
      total_units: number;
      is_active: boolean;
    }>(`
      SELECT id, slug, name_fr, name_ar, name_en, max_adults, max_children, base_price_dzd, total_units, is_active
      FROM rooms 
      WHERE id = $1 AND is_active = true
      FOR UPDATE;
    `, [roomId]);

    if (roomRes.rows.length === 0) {
      throw new Error('L\'hébergement sélectionné est introuvable ou indisponible.');
    }

    const room = roomRes.rows[0];

    if (adults > room.max_adults) {
      throw new Error(`Cet hébergement est limité à ${room.max_adults} adultes.`);
    }

    // 3. Strict Concurrency Double-Booking Check inside the locked transaction
    const overlapRes = await tx.query<{ booked_count: string }>(`
      SELECT COUNT(*) AS booked_count
      FROM reservations
      WHERE room_id = $1
        AND status NOT IN ('cancelled', 'expired', 'no_show')
        AND check_in < $2
        AND check_out > $3
    `, [roomId, checkOut, checkIn]);

    const bookedCount = parseInt(overlapRes.rows[0]?.booked_count || '0', 10);
    const availableUnits = room.total_units - bookedCount;

    if (availableUnits <= 0) {
      const err = new Error('Cet hébergement n\'est plus disponible pour les dates sélectionnées (conflit de réservation).');
      (err as any).statusCode = 409;
      (err as any).code = 'ROOM_UNAVAILABLE';
      throw err;
    }

    // 4. Calculate authoritative price from database (NEVER trust client price)
    const rateRes = await tx.query<{ name: string; multiplier: string }>(`
      SELECT name, multiplier 
      FROM rates 
      WHERE room_id = $1 
        AND start_date <= $2 
        AND end_date >= $3
      ORDER BY priority DESC 
      LIMIT 1
    `, [roomId, checkOut, checkIn]);

    const rateMultiplier = rateRes.rows[0] ? parseFloat(rateRes.rows[0].multiplier) : 1.0;
    const basePrice = parseFloat(room.base_price_dzd);
    const pricePerNight = Math.round(basePrice * rateMultiplier);
    const roomTotalDzd = pricePerNight * nights;

    // 5. Calculate authoritative services from database
    let servicesTotalDzd = 0;
    const resolvedServices: Array<{
      serviceId: string;
      name_fr: string;
      unitPriceDzd: number;
      quantity: number;
      totalDzd: number;
    }> = [];

    for (const item of services) {
      if (!item.serviceId || item.quantity <= 0) continue;
      const sRes = await tx.query<{
        id: string;
        name_fr: string;
        price_dzd: string;
        is_active: boolean;
      }>(`
        SELECT id, name_fr, price_dzd, is_active 
        FROM services 
        WHERE id = $1 AND is_active = true
      `, [item.serviceId]);

      if (sRes.rows.length > 0) {
        const s = sRes.rows[0];
        const unitPrice = parseFloat(s.price_dzd);
        const itemTotal = unitPrice * item.quantity;
        servicesTotalDzd += itemTotal;
        resolvedServices.push({
          serviceId: s.id,
          name_fr: s.name_fr,
          unitPriceDzd: unitPrice,
          quantity: item.quantity,
          totalDzd: itemTotal,
        });
      }
    }

    // 6. Calculate Taxes (Algerian tourism tax + 9% hospitality VAT)
    const taxesDzd = Math.round(roomTotalDzd * 0.09 + (nights * 500));
    const grandTotalDzd = roomTotalDzd + servicesTotalDzd + taxesDzd;

    // 7. Insert or update guest record
    let guestId = generateUuid();
    const guestCountry = guest.country ? guest.country.trim() : 'Algérie';
    const existingGuest = await tx.query<{ id: string }>(`
      SELECT id FROM guests WHERE email = $1 LIMIT 1
    `, [guest.email.toLowerCase().trim()]);

    if (existingGuest.rows.length > 0) {
      guestId = existingGuest.rows[0].id;
      await tx.query(`
        UPDATE guests 
        SET first_name = $1, last_name = $2, phone = $3, country = $4
        WHERE id = $5
      `, [guest.firstName.trim(), guest.lastName.trim(), guest.phone.trim(), guestCountry, guestId]);
    } else {
      await tx.query(`
        INSERT INTO guests (id, first_name, last_name, email, phone, country)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [guestId, guest.firstName.trim(), guest.lastName.trim(), guest.email.toLowerCase().trim(), guest.phone.trim(), guestCountry]);
    }

    // 8. Generate Unique Booking Number (Format: LGD-YYYY-XXXXXX)
    const reservationId = generateUuid();
    const bookingNumber = generateBookingNumber();

    // 9. Insert Reservation Record
    await tx.query(`
      INSERT INTO reservations (
        id, booking_number, room_id, guest_id, check_in, check_out,
        adults, children, status, special_requests, arrival_time,
        room_total_dzd, services_total_dzd, taxes_dzd, grand_total_dzd
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed', $9, $10, $11, $12, $13, $14)
    `, [
      reservationId,
      bookingNumber,
      roomId,
      guestId,
      checkIn,
      checkOut,
      adults,
      children,
      specialRequests.trim(),
      arrivalTime.trim(),
      roomTotalDzd,
      servicesTotalDzd,
      taxesDzd,
      grandTotalDzd,
    ]);

    // 10. Insert Reservation Services
    for (const rs of resolvedServices) {
      await tx.query(`
        INSERT INTO reservation_services (id, reservation_id, service_id, quantity, unit_price_dzd, total_dzd)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [generateUuid(), reservationId, rs.serviceId, rs.quantity, rs.unitPriceDzd, rs.totalDzd]);
    }

    // 11. Process Payment through Pluggable Payment Layer
    const provider = getPaymentProvider(paymentMethod);
    const paymentResult = await provider.processPayment({
      reservationId,
      amountDzd: grandTotalDzd,
      method: paymentMethod,
      customerName: `${guest.firstName} ${guest.lastName}`,
      customerEmail: guest.email,
    });

    await tx.query(`
      INSERT INTO payments (id, reservation_id, amount_dzd, method, status, transaction_ref, is_simulator)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      generateUuid(),
      reservationId,
      grandTotalDzd,
      paymentMethod,
      paymentResult.status,
      paymentResult.transactionRef,
      paymentResult.isSimulator,
    ]);

    // 12. Create Audit Log
    await tx.query(`
      INSERT INTO audit_logs (id, actor_email, action, entity, entity_id, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      generateUuid(),
      guest.email,
      'RESERVATION_CREATED',
      'reservation',
      bookingNumber,
      JSON.stringify({
        roomSlug: room.slug,
        checkIn,
        checkOut,
        nights,
        grandTotalDzd,
        paymentMethod,
      }),
    ]);

    return {
      id: reservationId,
      bookingNumber,
      roomName: room.name_fr,
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      status: 'confirmed',
      roomTotalDzd,
      servicesTotalDzd,
      taxesDzd,
      grandTotalDzd,
      guest: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        country: guest.country,
      },
      selectedServices: resolvedServices.map((s) => ({
        name: s.name_fr,
        quantity: s.quantity,
        totalDzd: s.totalDzd,
      })),
      payment: {
        ...paymentResult,
        method: paymentMethod,
      },
      createdAt: new Date().toISOString(),
    };
  });
}
