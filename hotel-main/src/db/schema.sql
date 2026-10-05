-- PostgreSQL Production Schema for La Gazelle d'Or Resort & Spa
-- Version: 1.0.0

CREATE TABLE IF NOT EXISTS migrations_history (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users & Staff Authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'staff', 'guest')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guest Profiles
CREATE TABLE IF NOT EXISTS guests (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  country VARCHAR(100) NOT NULL,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);

-- Room Types
CREATE TABLE IF NOT EXISTS room_types (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name_fr VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rooms & Accommodations
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  type_id VARCHAR(36) NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
  name_fr VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_fr TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  surface_sqm INT NOT NULL CHECK (surface_sqm > 0),
  max_adults INT NOT NULL CHECK (max_adults > 0),
  max_children INT NOT NULL DEFAULT 0 CHECK (max_children >= 0),
  bed_config VARCHAR(100) NOT NULL,
  base_price_dzd NUMERIC(12, 2) NOT NULL CHECK (base_price_dzd >= 0),
  total_units INT NOT NULL DEFAULT 1 CHECK (total_units > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Room Images
CREATE TABLE IF NOT EXISTS room_images (
  id VARCHAR(36) PRIMARY KEY,
  room_id VARCHAR(36) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images(room_id);

-- Amenities
CREATE TABLE IF NOT EXISTS amenities (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name_fr VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL
);

-- Room Amenities Mapping
CREATE TABLE IF NOT EXISTS room_amenities (
  room_id VARCHAR(36) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  amenity_id VARCHAR(36) NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, amenity_id)
);

-- Dynamic / Seasonal Rates
CREATE TABLE IF NOT EXISTS rates (
  id VARCHAR(36) PRIMARY KEY,
  room_id VARCHAR(36) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1.00 CHECK (multiplier > 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_weekend BOOLEAN DEFAULT false,
  priority INT DEFAULT 0,
  CHECK (start_date <= end_date)
);

CREATE INDEX IF NOT EXISTS idx_rates_dates ON rates(room_id, start_date, end_date);

-- Additional Services (Spa, Airport Shuttle, Desert Excursions, Dining)
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('dining', 'spa', 'transport', 'activity', 'other')),
  name_fr VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_fr TEXT,
  description_ar TEXT,
  description_en TEXT,
  price_dzd NUMERIC(10, 2) NOT NULL CHECK (price_dzd >= 0),
  duration_minutes INT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Special Offers & Promo Codes
CREATE TABLE IF NOT EXISTS offers (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  title_fr VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  discount_percentage NUMERIC(5, 2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CHECK (valid_from <= valid_until)
);

-- Core Reservations Table with Double-Booking Prevention & Constraints
CREATE TABLE IF NOT EXISTS reservations (
  id VARCHAR(36) PRIMARY KEY,
  booking_number VARCHAR(50) NOT NULL UNIQUE,
  room_id VARCHAR(36) NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  guest_id VARCHAR(36) NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INT NOT NULL CHECK (adults > 0),
  children INT NOT NULL DEFAULT 0 CHECK (children >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed' 
    CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'completed', 'expired')),
  special_requests TEXT,
  arrival_time VARCHAR(20),
  room_total_dzd NUMERIC(12, 2) NOT NULL CHECK (room_total_dzd >= 0),
  services_total_dzd NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (services_total_dzd >= 0),
  taxes_dzd NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (taxes_dzd >= 0),
  grand_total_dzd NUMERIC(12, 2) NOT NULL CHECK (grand_total_dzd >= 0),
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_check_dates CHECK (check_in < check_out)
);

-- Critical performance indexes for double booking checks & guest lookups
CREATE INDEX IF NOT EXISTS idx_reservations_room_dates_status 
  ON reservations (room_id, check_in, check_out, status);

CREATE INDEX IF NOT EXISTS idx_reservations_booking_number 
  ON reservations (booking_number);

CREATE INDEX IF NOT EXISTS idx_reservations_guest_id 
  ON reservations (guest_id);

-- Reservation Add-on Services Link
CREATE TABLE IF NOT EXISTS reservation_services (
  id VARCHAR(36) PRIMARY KEY,
  reservation_id VARCHAR(36) NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  service_id VARCHAR(36) NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_dzd NUMERIC(10, 2) NOT NULL CHECK (unit_price_dzd >= 0),
  total_dzd NUMERIC(12, 2) NOT NULL CHECK (total_dzd >= 0)
);

CREATE INDEX IF NOT EXISTS idx_res_services_res_id ON reservation_services(reservation_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  reservation_id VARCHAR(36) NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  amount_dzd NUMERIC(12, 2) NOT NULL CHECK (amount_dzd >= 0),
  method VARCHAR(50) NOT NULL CHECK (method IN ('arrival', 'cib', 'edahabia', 'card')),
  status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  transaction_ref VARCHAR(100),
  is_simulator BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id);

-- Notifications (System Event Ledger)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  actor_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
