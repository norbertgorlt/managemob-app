-- Managemob Database Schema for Supabase
-- Run this in the Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- REFERENCE / LOOKUP TABLES (no foreign key dependencies)
-- ============================================================

CREATE TABLE IF NOT EXISTS sending_organisations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mobility_service_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS language_course_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  country TEXT,
  language_taught TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS host_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  sector TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  tutor TEXT,
  tutor_phone TEXT,
  tutor_email TEXT,
  mobility_service_provider_id TEXT REFERENCES mobility_service_providers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Todo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transfer_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  normal_price DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accommodation (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  typology TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  mobile_phone TEXT,
  address TEXT,
  postcode TEXT,
  city TEXT,
  country TEXT,
  num_bedrooms INTEGER,
  size_m2 DECIMAL,
  has_desk BOOLEAN,
  has_internet BOOLEAN,
  has_washing_machine BOOLEAN,
  bathrooms_type TEXT,
  has_pets BOOLEAN,
  has_air_conditioning BOOLEAN,
  has_heating BOOLEAN,
  board_option_1 TEXT,
  price_week_option_1 DECIMAL,
  board_option_2 TEXT,
  price_week_option_2 DECIMAL,
  board_option_3 TEXT,
  price_week_option_3 DECIMAL,
  iban TEXT,
  swift TEXT,
  family_rules TEXT,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MAIN TABLE: Participants
-- ============================================================

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  -- Identity
  name TEXT,
  surname TEXT,
  sex TEXT,
  status TEXT,
  date_of_birth DATE,
  place_of_birth TEXT,
  nationality TEXT,
  marital_status TEXT,
  -- Contact
  email TEXT,
  phone TEXT,
  mobile_phone TEXT,
  -- Address
  address TEXT,
  postcode TEXT,
  city TEXT,
  country TEXT,
  -- Passport / Documents
  passport_number TEXT,
  passport_expiring_date DATE,
  driving_licence TEXT,
  passport_scan_url TEXT,
  -- Languages (proficiency levels A1-C2)
  lang_english TEXT,
  lang_spanish TEXT,
  lang_french TEXT,
  lang_german TEXT,
  lang_italian TEXT,
  lang_other TEXT,
  -- Language test
  language_test_validated TEXT,
  language_test_score TEXT,
  language_test_certificate TEXT,
  -- Education
  last_diploma TEXT,
  year_obtained TEXT,
  diploma_certificate TEXT,
  -- Banking
  swift_code TEXT,
  iban TEXT,
  -- Mobility
  mobility_typology TEXT,
  arrival_departure TEXT,
  indiv_group TEXT,
  destination_country TEXT,
  destination_city TEXT,
  arrival_date DATE,
  departure_date DATE,
  -- Language course
  language_course_start_date DATE,
  language_course_end_date DATE,
  language_course_weeks DECIMAL,
  -- Internship
  internship_start_date DATE,
  internship_end_date DATE,
  internship_weeks DECIMAL,
  -- Program
  group_name TEXT,
  project_name TEXT,
  program TEXT,
  -- Financial
  grant_amount DECIMAL,
  international_transport_cost DECIMAL,
  local_transport_cost DECIMAL,
  food_allowance_cost DECIMAL,
  insurance_cost DECIMAL,
  other_expenses DECIMAL,
  note_other_expenses TEXT,
  accommodation_1_cost DECIMAL,
  accommodation_2_cost DECIMAL,
  transfer_cost DECIMAL,
  -- Accommodation 1
  accommodation_1_start_date DATE,
  accommodation_1_end_date DATE,
  accommodation_1_weeks DECIMAL,
  -- Accommodation 2
  accommodation_2_start_date DATE,
  accommodation_2_end_date DATE,
  accommodation_2_weeks DECIMAL,
  -- Display fields
  id_name TEXT,
  id_formattato TEXT,
  record_number INTEGER,
  -- Foreign keys
  sending_organisation_id TEXT REFERENCES sending_organisations(id),
  host_company_id TEXT REFERENCES host_companies(id),
  insurance_provider_id TEXT REFERENCES insurance_providers(id),
  transfer_provider_id TEXT REFERENCES transfer_providers(id),
  mobility_service_provider_id TEXT REFERENCES mobility_service_providers(id),
  language_course_provider_id TEXT REFERENCES language_course_providers(id),
  accommodation_1_id TEXT REFERENCES accommodation(id),
  accommodation_2_id TEXT REFERENCES accommodation(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DEPENDENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS travel_details (
  id TEXT PRIMARY KEY,
  participant_id TEXT REFERENCES participants(id),
  transport_type TEXT,
  flight_train_number TEXT,
  ticket_purchase_date DATE,
  ticket_price DECIMAL,
  departure_datetime TIMESTAMPTZ,
  arrival_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_info (
  id TEXT PRIMARY KEY,
  participant_id TEXT REFERENCES participants(id),
  international_transport_cost DECIMAL,
  local_transport_cost DECIMAL,
  food_allowance_cost DECIMAL,
  insurance_cost DECIMAL,
  other_expenses DECIMAL,
  note_other_expenses TEXT,
  accommodation_cost DECIMAL,
  accommodation_2_cost DECIMAL,
  transfer_cost DECIMAL,
  grant_amount DECIMAL,
  margin DECIMAL,
  language_course_cost DECIMAL,
  cultural_activities_cost DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (basic open policy for anon read)
-- ============================================================

ALTER TABLE sending_organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobility_service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_course_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_info ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated" ON sending_organisations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON mobility_service_providers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON language_course_providers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON host_companies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON insurance_providers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON transfer_providers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON accommodation FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON participants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON travel_details FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON financial_info FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anon read
CREATE POLICY "Allow anon read" ON sending_organisations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON mobility_service_providers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON language_course_providers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON host_companies FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON insurance_providers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON transfer_providers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON accommodation FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON participants FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON travel_details FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON financial_info FOR SELECT TO anon USING (true);
