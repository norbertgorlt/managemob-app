-- ============================================================
-- MIGRATION: Add missing columns from Airtable CSV export
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. mobility_service_providers: add all missing fields
ALTER TABLE mobility_service_providers
  ADD COLUMN IF NOT EXISTS pic_number TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS postcode TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_comments TEXT,
  ADD COLUMN IF NOT EXISTS num_offices INTEGER,
  ADD COLUMN IF NOT EXISTS num_employees INTEGER,
  ADD COLUMN IF NOT EXISTS placement_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS placement_fees TEXT,
  ADD COLUMN IF NOT EXISTS geographic_area TEXT,
  ADD COLUMN IF NOT EXISTS specialty_1 TEXT,
  ADD COLUMN IF NOT EXISTS specialty_2 TEXT,
  ADD COLUMN IF NOT EXISTS specialty_3 TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. insurance_providers: add missing fields
ALTER TABLE insurance_providers
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. language_course_providers: add missing fields
ALTER TABLE language_course_providers
  ADD COLUMN IF NOT EXISTS address TEXT;
