import { query } from '../db/index.ts';

export interface AvailabilitySearchQuery {
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  roomSlug?: string;
}

export interface AvailableRoomOption {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  description_fr: string;
  description_ar: string;
  description_en: string;
  surface_sqm: number;
  max_adults: number;
  max_children: number;
  bed_config: string;
  total_units: number;
  available_units: number;
  base_price_dzd: number;
  price_per_night_dzd: number;
  nights: number;
  room_total_dzd: number;
  taxes_dzd: number;
  grand_total_dzd: number;
  rate_name: string;
  images: string[];
  amenities: Array<{
    code: string;
    name_fr: string;
    name_ar: string;
    name_en: string;
    icon_name: string;
  }>;
}

export async function searchAvailability(params: AvailabilitySearchQuery): Promise<{
  searchCriteria: {
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
  };
  rooms: AvailableRoomOption[];
}> {
  const { checkIn, checkOut, adults = 2, children = 0, roomSlug } = params;

  if (!checkIn || !checkOut) {
    throw new Error('Veuillez spécifier une date d\'arrivée et une date de départ valides.');
  }

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
    throw new Error('Format de date invalide. Format attendu : AAAA-MM-JJ.');
  }

  if (inDate >= outDate) {
    throw new Error('La date de départ doit être strictement postérieure à la date d\'arrivée.');
  }

  const diffTime = outDate.getTime() - inDate.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  // Query active rooms
  let roomSql = `
    SELECT r.*, rt.code as type_code, rt.name_fr as type_name_fr
    FROM rooms r
    JOIN room_types rt ON r.type_id = rt.id
    WHERE r.is_active = true
      AND r.max_adults >= $1
  `;
  const roomQueryParams: any[] = [adults];

  if (roomSlug) {
    roomSql += ' AND r.slug = $2';
    roomQueryParams.push(roomSlug);
  }

  roomSql += ' ORDER BY r.base_price_dzd ASC';

  const roomsRes = await query(roomSql, roomQueryParams);
  const availableRooms: AvailableRoomOption[] = [];

  for (const r of roomsRes.rows) {
    // 1. Calculate active overlapping reservations in PostgreSQL
    const overlapRes = await query<{ booked_count: string }>(`
      SELECT COUNT(*) AS booked_count
      FROM reservations
      WHERE room_id = $1
        AND status NOT IN ('cancelled', 'expired', 'no_show')
        AND check_in < $2
        AND check_out > $3
    `, [r.id, checkOut, checkIn]);

    const bookedCount = parseInt(overlapRes.rows[0]?.booked_count || '0', 10);
    const availableUnits = r.total_units - bookedCount;

    if (availableUnits > 0) {
      // 2. Calculate dynamic rate multiplier from PostgreSQL rates table
      const rateRes = await query<{ name: string; multiplier: string }>(`
        SELECT name, multiplier 
        FROM rates 
        WHERE room_id = $1 
          AND start_date <= $2 
          AND end_date >= $3
        ORDER BY priority DESC 
        LIMIT 1
      `, [r.id, checkOut, checkIn]);

      const rateMultiplier = rateRes.rows[0] ? parseFloat(rateRes.rows[0].multiplier) : 1.0;
      const rateName = rateRes.rows[0]?.name || 'Tarif Standard Saharien';

      const basePrice = parseFloat(r.base_price_dzd);
      const pricePerNight = Math.round(basePrice * rateMultiplier);
      const roomTotal = pricePerNight * nights;
      // Algerian tourist tax (500 DZD per night) + 9% VAT
      const taxes = Math.round(roomTotal * 0.09 + (nights * 500));
      const grandTotal = roomTotal + taxes;

      // 3. Fetch images
      const imagesRes = await query<{ url: string }>(`
        SELECT url FROM room_images WHERE room_id = $1 ORDER BY display_order ASC
      `, [r.id]);

      // 4. Fetch amenities
      const amenitiesRes = await query<{
        code: string;
        name_fr: string;
        name_ar: string;
        name_en: string;
        icon_name: string;
      }>(`
        SELECT a.code, a.name_fr, a.name_ar, a.name_en, a.icon_name
        FROM amenities a
        JOIN room_amenities ra ON a.id = ra.amenity_id
        WHERE ra.room_id = $1
      `, [r.id]);

      availableRooms.push({
        id: r.id,
        slug: r.slug,
        name_fr: r.name_fr,
        name_ar: r.name_ar,
        name_en: r.name_en,
        description_fr: r.description_fr,
        description_ar: r.description_ar,
        description_en: r.description_en,
        surface_sqm: r.surface_sqm,
        max_adults: r.max_adults,
        max_children: r.max_children,
        bed_config: r.bed_config,
        total_units: r.total_units,
        available_units: availableUnits,
        base_price_dzd: basePrice,
        price_per_night_dzd: pricePerNight,
        nights,
        room_total_dzd: roomTotal,
        taxes_dzd: taxes,
        grand_total_dzd: grandTotal,
        rate_name: rateName,
        images: imagesRes.rows.map((img) => img.url),
        amenities: amenitiesRes.rows,
      });
    }
  }

  return {
    searchCriteria: {
      checkIn,
      checkOut,
      nights,
      adults: Number(adults),
      children: Number(children),
    },
    rooms: availableRooms,
  };
}
