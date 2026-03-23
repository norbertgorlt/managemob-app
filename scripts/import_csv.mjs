import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'datiAirtable')

const SUPABASE_URL = 'https://emxgzyagctsygoqzvmuu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVteGd6eWFnY3RzeWdvcXp2bXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MzU1MzUsImV4cCI6MjA4OTUxMTUzNX0.LM-DjuDk0haKLadjg6RNmqo67H-WM60jK1MSMmA6Oio'

// Use SUPABASE_SERVICE_KEY env var if available (bypasses RLS), otherwise use anon key + login
const KEY = process.env.SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, KEY)

// If no service key, log in with credentials
if (!process.env.SUPABASE_SERVICE_KEY) {
  const email = process.env.SUPABASE_EMAIL
  const password = process.env.SUPABASE_PASSWORD
  if (!email || !password) {
    console.error('ERROR: Provide SUPABASE_SERVICE_KEY=xxx or both SUPABASE_EMAIL=xxx SUPABASE_PASSWORD=xxx')
    console.error('Example: SUPABASE_EMAIL=you@example.com SUPABASE_PASSWORD=yourpwd node scripts/import_csv.mjs')
    process.exit(1)
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) { console.error('Login failed:', error.message); process.exit(1) }
  console.log('Logged in as', email)
}

function readCSV(filename) {
  const content = readFileSync(join(DATA_DIR, filename), 'utf-8').replace(/^\uFEFF/, '')
  return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true, trim: true })
}

function parseNum(val) {
  if (!val || val.trim() === '') return null
  const n = parseFloat(val.replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? null : n
}

function parseDate(val) {
  if (!val || val.trim() === '') return null
  return val.trim()
}

function parseBool(val) {
  if (!val || val.trim() === '') return null
  const v = val.trim().toLowerCase()
  if (v === 'true' || v === 'yes' || v === '1' || v === 'checked') return true
  if (v === 'false' || v === 'no' || v === '0') return false
  return null
}

function str(val) {
  if (!val || val.trim() === '') return null
  return val.trim()
}

async function upsert(table, rows) {
  if (rows.length === 0) return
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' })
  if (error) {
    console.error(`  ERROR in ${table}:`, error.message)
  } else {
    console.log(`  OK: ${rows.length} rows in ${table}`)
  }
}

// ─── 1. Sending Organisations ───────────────────────────────────────────────
async function importSendingOrgs() {
  console.log('\n[1/9] Sending Organisations...')
  const rows = readCSV('Sending Organisations.csv')
  const mapped = rows.map(r => ({
    id: r['_id'],
    name: str(r['Name']) || '(senza nome)',
    contact_person: str(r['Contact Person']),
    email: str(r['E-mail']),
    phone: str(r['Tel']),
    address: str(r['Address']),
    city: str(r['City']),
    country: str(r['Country']),
  })).filter(r => r.id)
  await upsert('sending_organisations', mapped)
}

// ─── 2. Mobility Service Providers ──────────────────────────────────────────
async function importMobilityProviders() {
  console.log('\n[2/9] Mobility Service Providers...')
  const rows = readCSV('Mobility Service Providers.csv')
  const mapped = rows.map(r => ({
    id: r['_id'],
    name: str(r['Name of the organisation']) || '(senza nome)',
    pic_number: str(r['PIC number']),
    address: str(r['Address']),
    postcode: str(r['Postcode']),
    city: str(r['City']),
    country: null,
    website: str(r['Website']),
    email: str(r['Email']),
    phone: str(r['Phone']),
    contact_person: str(r['Contact Person']),
    contact_email: str(r['Contact Email Address']),
    contact_phone: str(r['Contact Phone']),
    contact_comments: str(r['Contact Comments']),
    num_offices: parseNum(r['Number of offices']),
    num_employees: parseNum(r['Number of Employees']),
    placement_capacity: parseNum(r['Placement Capacity']),
    placement_fees: str(r['Placement Fees']),
    geographic_area: str(r['Geographic Area Covered']),
    specialty_1: str(r['Specialty 1']),
    specialty_2: str(r['Specialty 2']),
    specialty_3: str(r['Specialty 3']),
    notes: str(r['Notes']),
  })).filter(r => r.id)
  await upsert('mobility_service_providers', mapped)
}

// ─── 3. Language Course Providers ───────────────────────────────────────────
async function importLanguageCourseProviders() {
  console.log('\n[3/9] Language Course Providers...')
  const rows = readCSV('Language Course Provider.csv')
  const mapped = rows.map(r => ({
    id: r['_id'],
    name: str(r['Provider Name']) || '(senza nome)',
    address: str(r['Address']),
    city: str(r['City']),
    country: str(r['Country']),
    contact_person: str(r['Contact Person']),
    email: str(r['E-mail']),
    phone: str(r['Phone']),
    language_taught: str(r['Language Teach']),
  })).filter(r => r.id)
  await upsert('language_course_providers', mapped)
}

// ─── 4. Insurance Providers ──────────────────────────────────────────────────
async function importInsuranceProviders() {
  console.log('\n[4/9] Insurance Providers...')
  const rows = readCSV('Insurance.csv')
  const mapped = rows.map(r => ({
    id: r['_id'],
    name: str(r['Insurance Provider']) || '(senza nome)',
    contact_person: str(r['Contact Person']),
    phone: str(r['Phone']),
    email: str(r['Email']),
    address: str(r['Address']),
    city: str(r['City']),
    notes: str(r['Notes']),
    status: str(r['Status']),
  })).filter(r => r.id)
  await upsert('insurance_providers', mapped)
}

// ─── 5. Host Companies ───────────────────────────────────────────────────────
async function importHostCompanies() {
  console.log('\n[5/9] Host Companies...')
  const rows = readCSV('Host companies.csv')
  const mapped = rows.map(r => ({
    id: r['_id'],
    name: str(r['Host Company']) || '(senza nome)',
    address: str(r['Address']),
    city: str(r['City']),
    sector: str(r['Sector']),
    contact_person: str(r['Contact Person']),
    email: str(r['E-mail']),
    phone: str(r['Phone']),
    tutor: str(r['HC Tutor']),
    tutor_phone: str(r['Tutor Mobile Phone']),
    tutor_email: str(r['Tutor E-mail']),
  })).filter(r => r.id)
  await upsert('host_companies', mapped)
}

// ─── 6. Accommodation ────────────────────────────────────────────────────────
async function importAccommodation() {
  console.log('\n[6/9] Accommodation...')
  const rows = readCSV('Accommodation.csv')
  const mapped = rows.map(r => ({
    id: r['_id'],
    name: str(r['Accommodation 1']) || '(senza nome)',
    typology: str(r['Accommodation Typology']),
    contact_person: str(r['Contact Person']),
    email: str(r['E-mail']),
    phone: str(r['Phone']),
    mobile_phone: str(r['Mobile phone']),
    address: str(r['Address']),
    postcode: str(r['Postcode']),
    city: str(r['City']),
    country: str(r['Country']),
    num_bedrooms: parseNum(r['Number of bedrooms']),
    size_m2: parseNum(r['Size unit (m²)']),
    has_desk: parseBool(r['Desk']),
    has_internet: parseBool(r['Internet access']),
    has_washing_machine: parseBool(r['Access to a washing machine']),
    bathrooms_type: str(r['Private or shared bathrooms']),
    has_pets: parseBool(r['Pets present in the household']),
    has_air_conditioning: parseBool(r['Air conditioning']),
    has_heating: parseBool(r['Heating']),
    board_option_1: str(r['Board basis option 1']),
    price_week_option_1: parseNum(r['Price p/w option 1']),
    board_option_2: str(r['Board basis option 2']),
    price_week_option_2: parseNum(r['Price p/w option 2']),
    board_option_3: str(r['Board basis option 3']),
    price_week_option_3: parseNum(r['Price p/w option 3']),
    iban: str(r['Bank details IBAN']),
    swift: str(r['Bank details SWIFT']),
    family_rules: str(r['Internal Rules of the host family or host']),
    comments: str(r['Comment']),
  })).filter(r => r.id)
  await upsert('accommodation', mapped)
}

// ─── 7. Transfer Providers ───────────────────────────────────────────────────
async function importTransfer() {
  console.log('\n[7/9] Transfer Providers...')
  const rows = readCSV('Transfer.csv')
  const mapped = rows.map(r => ({
    id: r['_id'],
    name: str(r['Transfer Provider']) || '(senza nome)',
    contact_person: str(r['Contact Person']),
    phone: str(r['Phone']),
    email: str(r['E-mail']),
    normal_price: parseNum(r['Transfer Normal Price']),
    notes: str(r['Notes']),
  })).filter(r => r.id)
  await upsert('transfer_providers', mapped)
}

// ─── 8. Participants ─────────────────────────────────────────────────────────
async function importParticipants() {
  console.log('\n[8/9] Participants...')
  const rows = readCSV('Participants.csv')
  const mapped = rows.map(r => ({
    id: r['_id'],
    id_name: str(r['ID Name']),
    id_formattato: str(r['ID Formattato']),
    record_number: parseNum(r['Record Number']),
    mobility_typology: str(r['Mobility Typology']),
    arrival_departure: str(r['Arrival/Departure']),
    indiv_group: str(r['Indiv./Group']),
    name: str(r['Name']),
    surname: str(r['Surname']),
    sex: str(r['Sex']),
    status: str(r['Status']),
    date_of_birth: parseDate(r['Date of birth']),
    place_of_birth: str(r['Place of Birth']),
    nationality: str(r['Nationality']),
    marital_status: str(r['Marital Status']),
    address: str(r['Address']),
    postcode: str(r['Postcode']),
    city: str(r['City']),
    country: str(r['Country']),
    email: str(r['Email']),
    phone: str(r['Phone']),
    mobile_phone: str(r['Mobile Phone']),
    passport_number: str(r['Passport Number']),
    passport_expiring_date: parseDate(r['Passport Expiring Date']),
    driving_licence: str(r['Driving Licence']),
    lang_english: str(r['Language: English']),
    lang_spanish: str(r['Language: Spanish']),
    lang_french: str(r['Language: French']),
    lang_german: str(r['Language: German']),
    lang_italian: str(r['Language: Italian']),
    lang_other: str(r['Language: Other']),
    language_test_validated: str(r['Language Test Validated']),
    language_test_score: str(r['Language Test Score']),
    last_diploma: str(r['Last Validated Diploma']),
    year_obtained: str(r['Year Obtained']),
    swift_code: str(r['Bank details - SWIFT CODE']),
    iban: str(r['Bank Details - IBAN']),
    destination_country: str(r['Destination Country']),
    destination_city: str(r['Destination_City']),
    arrival_date: parseDate(r['Arrivals Date']),
    departure_date: parseDate(r['Departure Date']),
    language_course_start_date: parseDate(r['Language Course Start Date']),
    language_course_end_date: parseDate(r['Language Course End Date']),
    language_course_weeks: parseNum(r['Language Course Weeks']),
    internship_start_date: parseDate(r['Internship Start Date']),
    internship_end_date: parseDate(r['Internship End Date']),
    internship_weeks: parseNum(r['Internship Weeks']),
    group_name: str(r['Group Name']),
    project_name: str(r['Project Name']),
    program: str(r['Program']),
    grant_amount: parseNum(r['Grant Amount']),
    international_transport_cost: parseNum(r['International Transport Cost']),
    local_transport_cost: parseNum(r['Local Transport Cost']),
    food_allowance_cost: parseNum(r['Food Allowance Cost']),
    insurance_cost: parseNum(r['Insurance Cost']),
    other_expenses: parseNum(r['Other Expenses']),
    note_other_expenses: str(r['Note for other expences']),
    accommodation_1_cost: parseNum(r['Accommodation 1 Cost']),
    accommodation_2_cost: parseNum(r['Accommodation 2 Cost']),
    transfer_cost: parseNum(r['Transfer Cost']),
    accommodation_1_start_date: parseDate(r['Accommodation Start Date 1']),
    accommodation_1_end_date: parseDate(r['Accommodation End Date 1']),
    accommodation_1_weeks: parseNum(r['Accommodation/Week']),
    accommodation_2_start_date: parseDate(r['Accommodation Start Date 2']),
    accommodation_2_end_date: parseDate(r['Accommodation End Date 2']),
    accommodation_2_weeks: parseNum(r['Accommodation 2 Week']),
  })).filter(r => r.id)

  // Upsert in chunks of 50
  for (let i = 0; i < mapped.length; i += 50) {
    const chunk = mapped.slice(i, i + 50)
    const { error } = await supabase.from('participants').upsert(chunk, { onConflict: 'id' })
    if (error) {
      console.error(`  ERROR participants chunk ${i}-${i + 50}:`, error.message)
    }
  }
  console.log(`  OK: ${mapped.length} participants`)
}

// ─── 9. Financial Info ───────────────────────────────────────────────────────
async function importFinancialInfo() {
  console.log('\n[9/9] Financial Info...')
  const rows = readCSV('Financial info.csv')
  const mapped = rows.map(r => ({
    id: r['_id'],
    international_transport_cost: parseNum(r['International Transport Cost']),
    local_transport_cost: parseNum(r['Local Transport Cost']),
    food_allowance_cost: parseNum(r['Food Allowance Cost']),
    insurance_cost: parseNum(r['Insurance Cost']),
    other_expenses: parseNum(r['Other Exepences Cost']),
    note_other_expenses: str(r['Note for Other Experiences Cost']),
    accommodation_cost: parseNum(r['Accommodation']),
    accommodation_2_cost: parseNum(r['Accommodation 2']),
    transfer_cost: parseNum(r['Transfer Cost']),
    grant_amount: parseNum(r['Grant']),
    margin: parseNum(r['Margin']),
    language_course_cost: parseNum(r['Language Course Cost']),
    cultural_activities_cost: parseNum(r['Cultural Activities Cost']),
  })).filter(r => r.id)
  await upsert('financial_info', mapped)
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Managemob CSV Import ===')
  console.log('NOTE: Run supabase_migration.sql in Supabase SQL Editor first if tables need new columns.\n')

  await importSendingOrgs()
  await importMobilityProviders()
  await importLanguageCourseProviders()
  await importInsuranceProviders()
  await importHostCompanies()
  await importAccommodation()
  await importTransfer()
  await importParticipants()
  await importFinancialInfo()

  console.log('\n=== Import completato ===')
}

main().catch(console.error)
