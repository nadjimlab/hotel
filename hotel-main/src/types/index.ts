export type Language = 'fr' | 'ar' | 'en';

export interface RoomAmenity {
  code: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  icon_name: string;
}

export interface Room {
  id: string;
  slug: string;
  type_id: string;
  type_code?: string;
  type_name_fr?: string;
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
  base_price_dzd: number;
  price_per_night_dzd?: number;
  nights?: number;
  room_total_dzd?: number;
  taxes_dzd?: number;
  grand_total_dzd?: number;
  available_units?: number;
  total_units: number;
  rate_name?: string;
  images: string[];
  amenities: RoomAmenity[];
}

export interface HotelService {
  id: string;
  code: string;
  category: 'dining' | 'spa' | 'transport' | 'activity' | 'other';
  name_fr: string;
  name_ar: string;
  name_en: string;
  description_fr?: string;
  description_ar?: string;
  description_en?: string;
  price_dzd: number;
  duration_minutes?: number;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

export interface Reservation {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show' | 'completed' | 'expired';
  specialRequests?: string;
  arrivalTime?: string;
  roomTotalDzd: number;
  servicesTotalDzd: number;
  taxesDzd: number;
  grandTotalDzd: number;
  createdAt: string;
  guest: GuestInfo;
  room?: {
    slug: string;
    name_fr: string;
    name_ar: string;
    name_en: string;
  };
  services?: Array<{
    name_fr: string;
    name_ar: string;
    name_en: string;
    quantity: number;
    unitPriceDzd: number;
    totalDzd: number;
  }>;
  payment?: {
    method: string;
    status: string;
    transactionRef: string;
    isSimulator: boolean;
  };
}

export interface AdminDashboardKPIs {
  todayArrivals: number;
  todayDepartures: number;
  activeReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  occupancyRate: number;
  totalRevenueDzd: number;
  totalRoomsInventory: number;
}
