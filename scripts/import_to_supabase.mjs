/**
 * Managemob Data Import Script
 * Imports CSV data from Airtable export into Supabase
 *
 * Usage:
 *   node scripts/import_to_supabase.mjs
 *
 * Requirements:
 *   npm install @supabase/supabase-js csv-parse
 */

import { createClient } from '@supabase/supabase-js'
import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_DIR = resolve(__dirname, '../../Docs/airtable_export/csv')

const SUPABASE_URL = 'https://emxgzyagctsygoqzvmuu.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVteGd6eWFnY3RzeWdvcXp2bXV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkzNTUzNSwiZXhwIjoyMDg5NTExNTM1fQ.7r2RI9raNEo7bnUMzhFiYKKc8kEr-qZu5kxR8uYNR4w'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = []
    createReadStream(filePath)
      .pipe(parse({
        columns: true,
        bom: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject)
  })
}

function parseNum(val) {
  if (!val || val === '' || val.includes('NaN')) return null
  const cleaned = val.replace(/[€$,\s]/g, '').trim()
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function parseDate(val) {
  if (!val || val === '') return null
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return null
    return d.toISOString().split('T')[0]
  } catch {
    return null
  }
}

function parseRef(val) {
  // Airtable references can be single IDs or comma-separated lists
  if (!val || val === '') return null
  // Return first reference if multiple
  return val.split(',')[0].trim() || null
}

async function importSendingOrganisations() {
  console.log('Importing Sending Organisations...')
  const rows = await parseCSV(`${CSV_DIR}/Sending Organisations.csv`)

  const records = rows.map(r => ({
    id: r['_id'],
    name: r['Sending Organisation'] || r['Name'] || 'Unknown',
    contact_person: r['Contact Person'] || null,
    email: r['E-mail'] || null,
    phone: r['Phone'] || null,
    address: r['Address'] || null,
    city: r['City'] || null,
    country: r['Country'] || null,
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  const { error } = await supabase.from('sending_organisations').upsert(records, { onConflict: 'id' })
  if (error) console.error('Error importing sending_organisations:', error.message)
  else console.log(`  ✓ ${records.length} sending organisations imported`)
}

async function importMobilityServiceProviders() {
  console.log('Importing Mobility Service Providers...')
  const rows = await parseCSV(`${CSV_DIR}/Mobility Service Providers.csv`)

  const records = rows.map(r => ({
    id: r['_id'],
    name: r['Mobility Service Provider'] || r['Name'] || 'Unknown',
    contact_person: r['Contact Person'] || null,
    email: r['E-mail'] || null,
    phone: r['Phone'] || null,
    city: r['City'] || null,
    country: r['Country'] || null,
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  const { error } = await supabase.from('mobility_service_providers').upsert(records, { onConflict: 'id' })
  if (error) console.error('Error importing mobility_service_providers:', error.message)
  else console.log(`  ✓ ${records.length} mobility service providers imported`)
}

async function importLanguageCourseProviders() {
  console.log('Importing Language Course Providers...')
  const rows = await parseCSV(`${CSV_DIR}/Language Course Provider.csv`)

  const records = rows.map(r => ({
    id: r['_id'],
    name: r['Language Course Provider'] || r['Name'] || 'Unknown',
    contact_person: r['Contact Person'] || null,
    email: r['E-mail'] || null,
    phone: r['Phone'] || null,
    city: r['City'] || null,
    country: r['Country'] || null,
    language_taught: r['Language'] || null,
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  const { error } = await supabase.from('language_course_providers').upsert(records, { onConflict: 'id' })
  if (error) console.error('Error importing language_course_providers:', error.message)
  else console.log(`  ✓ ${records.length} language course providers imported`)
}

async function importHostCompanies() {
  console.log('Importing Host Companies...')
  const rows = await parseCSV(`${CSV_DIR}/Host companies.csv`)

  const records = rows.map(r => ({
    id: r['_id'],
    name: r['Host Company'] || 'Unknown',
    address: r['Address'] || null,
    city: r['City'] || null,
    sector: r['Sector'] || null,
    contact_person: r['Contact Person'] || null,
    email: r['E-mail'] || null,
    phone: r['Phone'] || null,
    tutor: r['HC Tutor'] || null,
    tutor_phone: r['Tutor Mobile Phone'] || null,
    tutor_email: r['Tutor E-mail'] || null,
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  const { error } = await supabase.from('host_companies').upsert(records, { onConflict: 'id' })
  if (error) console.error('Error importing host_companies:', error.message)
  else console.log(`  ✓ ${records.length} host companies imported`)
}

async function importInsuranceProviders() {
  console.log('Importing Insurance Providers...')
  const rows = await parseCSV(`${CSV_DIR}/Insurance.csv`)

  const records = rows.map(r => ({
    id: r['_id'],
    name: r['Insurance Provider'] || r['Name'] || 'Unknown',
    contact_person: r['Contact Person'] || null,
    email: r['E-mail'] || null,
    phone: r['Phone'] || null,
    status: r['Status'] || 'Todo',
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  const { error } = await supabase.from('insurance_providers').upsert(records, { onConflict: 'id' })
  if (error) console.error('Error importing insurance_providers:', error.message)
  else console.log(`  ✓ ${records.length} insurance providers imported`)
}

async function importTransferProviders() {
  console.log('Importing Transfer Providers...')
  const rows = await parseCSV(`${CSV_DIR}/Transfer.csv`)

  const records = rows.map(r => ({
    id: r['_id'],
    name: r['Transfer'] || r['Transfer Provider'] || r['Name'] || 'Unknown',
    contact_person: r['Contact Person'] || null,
    phone: r['Phone'] || null,
    email: r['E-mail'] || null,
    normal_price: parseNum(r['Normal price per transfer']),
    notes: r['Notes'] || null,
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  const { error } = await supabase.from('transfer_providers').upsert(records, { onConflict: 'id' })
  if (error) console.error('Error importing transfer_providers:', error.message)
  else console.log(`  ✓ ${records.length} transfer providers imported`)
}

async function importAccommodation() {
  console.log('Importing Accommodation...')
  const rows = await parseCSV(`${CSV_DIR}/Accommodation.csv`)

  const records = rows.map(r => ({
    id: r['_id'],
    name: r['Accommodation 1'] || 'Unknown',
    typology: r['Accommodation Typology'] || null,
    contact_person: r['Contact Person'] || null,
    email: r['E-mail'] || null,
    phone: r['Phone'] || null,
    mobile_phone: r['Mobile phone'] || null,
    address: r['Address'] || null,
    postcode: r['Postcode'] || null,
    city: r['City'] || null,
    country: r['Country'] || null,
    num_bedrooms: parseNum(r['Number of bedrooms']) ? parseInt(r['Number of bedrooms']) : null,
    size_m2: parseNum(r['Size unit (m²)']),
    has_desk: r['Desk'] === 'Yes' ? true : r['Desk'] === 'No' ? false : null,
    has_internet: r['Internet access'] === 'Yes' ? true : r['Internet access'] === 'No' ? false : null,
    has_washing_machine: r['Access to a washing machine'] === 'Yes' ? true : r['Access to a washing machine'] === 'No' ? false : null,
    bathrooms_type: r['Private or shared bathrooms'] || null,
    has_pets: r['Pets present in the household'] === 'Yes' ? true : r['Pets present in the household'] === 'No' ? false : null,
    has_air_conditioning: r['Air conditioning'] === 'Yes' ? true : r['Air conditioning'] === 'No' ? false : null,
    has_heating: r['Heating'] === 'Yes' ? true : r['Heating'] === 'No' ? false : null,
    board_option_1: r['Board basis option 1'] || null,
    price_week_option_1: parseNum(r['Price p/w option 1']),
    board_option_2: r['Board basis option 2'] || null,
    price_week_option_2: parseNum(r['Price p/w option 2']),
    board_option_3: r['Board basis option 3'] || null,
    price_week_option_3: parseNum(r['Price p/w option 3']),
    iban: r['Bank details IBAN'] || null,
    swift: r['Bank details SWIFT'] || null,
    family_rules: r['Internal Rules of the host family or host'] || null,
    comments: r['Comment'] || null,
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  const { error } = await supabase.from('accommodation').upsert(records, { onConflict: 'id' })
  if (error) console.error('Error importing accommodation:', error.message)
  else console.log(`  ✓ ${records.length} accommodation records imported`)
}

async function importParticipants() {
  console.log('Importing Participants...')
  const rows = await parseCSV(`${CSV_DIR}/Participants.csv`)

  // Load valid accommodation IDs
  const { data: accomData } = await supabase.from('accommodation').select('id')
  const validAccomIds = new Set((accomData || []).map(r => r.id))

  // Load valid host company IDs
  const { data: hcData } = await supabase.from('host_companies').select('id')
  const validHcIds = new Set((hcData || []).map(r => r.id))

  // Load valid sending org IDs
  const { data: soData } = await supabase.from('sending_organisations').select('id')
  const validSoIds = new Set((soData || []).map(r => r.id))

  // Load valid insurance provider IDs
  const { data: insData } = await supabase.from('insurance_providers').select('id')
  const validInsIds = new Set((insData || []).map(r => r.id))

  // Load valid transfer provider IDs
  const { data: trData } = await supabase.from('transfer_providers').select('id')
  const validTrIds = new Set((trData || []).map(r => r.id))

  // Load valid mobility service provider IDs
  const { data: mspData } = await supabase.from('mobility_service_providers').select('id')
  const validMspIds = new Set((mspData || []).map(r => r.id))

  // Load valid language course provider IDs
  const { data: lcpData } = await supabase.from('language_course_providers').select('id')
  const validLcpIds = new Set((lcpData || []).map(r => r.id))

  const safeRef = (id, validSet) => (id && validSet.has(id)) ? id : null

  const records = rows.map(r => ({
    id: r['_id'],
    name: r['Name'] || null,
    surname: r['Surname'] || null,
    sex: r['Sex'] || null,
    status: r['Status'] || null,
    date_of_birth: parseDate(r['Date of birth']),
    place_of_birth: r['Place of Birth'] || null,
    nationality: r['Nationality'] || null,
    marital_status: r['Marital Status'] || null,
    email: r['Email'] || null,
    phone: r['Phone'] || null,
    mobile_phone: r['Mobile Phone'] || null,
    address: r['Address'] || null,
    postcode: r['Postcode'] || null,
    city: r['City'] || null,
    country: r['Country'] || null,
    passport_number: r['Passport Number'] || null,
    passport_expiring_date: parseDate(r['Passport Expiring Date']),
    driving_licence: r['Driving Licence'] || null,
    lang_english: r['Language: English'] || null,
    lang_spanish: r['Language: Spanish'] || null,
    lang_french: r['Language: French'] || null,
    lang_german: r['Language: German'] || null,
    lang_italian: r['Language: Italian'] || null,
    lang_other: r['Language: Other'] || null,
    language_test_validated: r['Language Test Validated'] || null,
    language_test_score: r['Language Test Score'] || null,
    language_test_certificate: r['Language Test Certificate'] || null,
    last_diploma: r['Last Validated Diploma'] || null,
    year_obtained: r['Year Obtained'] || null,
    swift_code: r['Bank details - SWIFT CODE'] || null,
    iban: r['Bank Details - IBAN'] || null,
    mobility_typology: r['Mobility Typology'] || null,
    arrival_departure: r['Arrival/Departure'] || null,
    indiv_group: r['Indiv./Group'] || null,
    destination_country: r['Destination Country'] || null,
    destination_city: r['Destination_City'] || null,
    arrival_date: parseDate(r['Arrivals Date']),
    departure_date: parseDate(r['Departure Date']),
    language_course_start_date: parseDate(r['Language Course Start Date']),
    language_course_end_date: parseDate(r['Language Course End Date']),
    language_course_weeks: parseNum(r['Language Course Weeks']),
    internship_start_date: parseDate(r['Internship Start Date']),
    internship_end_date: parseDate(r['Internship End Date']),
    internship_weeks: parseNum(r['Internship Weeks']),
    group_name: r['Group Name'] || null,
    project_name: r['Project Name'] || null,
    program: r['Program'] || null,
    grant_amount: parseNum(r['Grant Amount']),
    international_transport_cost: parseNum(r['International Transport Cost']),
    local_transport_cost: parseNum(r['Local Transport Cost']),
    food_allowance_cost: parseNum(r['Food Allowance Cost']),
    insurance_cost: parseNum(r['Insurance Cost']),
    other_expenses: parseNum(r['Other Expenses']),
    note_other_expenses: r['Note for other expences'] || null,
    accommodation_1_cost: parseNum(r['Accommodation 1 Cost']),
    accommodation_2_cost: parseNum(r['Accommodation 2 Cost']),
    transfer_cost: parseNum(r['Transfer Cost']),
    accommodation_1_start_date: parseDate(r['Accommodation Start Date 1']),
    accommodation_1_end_date: parseDate(r['Accommodation End Date 1']),
    accommodation_1_weeks: parseNum(r['Accommodation/Week']),
    accommodation_2_start_date: parseDate(r['Accommodation Start Date 2']),
    accommodation_2_end_date: parseDate(r['Accommodation End Date 2']),
    accommodation_2_weeks: parseNum(r['Accommodation 2 Week']),
    id_name: r['ID Name'] || null,
    id_formattato: r['ID Formattato'] || null,
    record_number: r['Record Number'] ? parseInt(r['Record Number']) : null,
    sending_organisation_id: safeRef(parseRef(r['Sending Organisation (from Sending Organisations)']), validSoIds),
    host_company_id: safeRef(parseRef(r['Host Company']), validHcIds),
    insurance_provider_id: safeRef(parseRef(r['Insurance Provider']), validInsIds),
    transfer_provider_id: safeRef(parseRef(r['Transfer Provider']), validTrIds),
    mobility_service_provider_id: safeRef(parseRef(r['Mobility service provider']), validMspIds),
    language_course_provider_id: safeRef(parseRef(r['Language Course Provider']), validLcpIds),
    accommodation_1_id: safeRef(parseRef(r['Accommodation 1']), validAccomIds),
    accommodation_2_id: safeRef(parseRef(r['Accommodation 2']), validAccomIds),
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  // Import in batches of 20 to avoid issues
  const batchSize = 20
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const { error } = await supabase.from('participants').upsert(batch, { onConflict: 'id' })
    if (error) console.error(`Error importing participants batch ${i}-${i+batchSize}:`, error.message)
  }
  console.log(`  ✓ ${records.length} participants imported`)
}

async function importTravelDetails() {
  console.log('Importing Travel Details...')
  const rows = await parseCSV(`${CSV_DIR}/Travel Details.csv`)

  const { data: partData } = await supabase.from('participants').select('id')
  const validPartIds = new Set((partData || []).map(r => r.id))

  const records = rows.map(r => ({
    id: r['_id'],
    participant_id: (r['Participants'] && validPartIds.has(r['Participants'])) ? r['Participants'] : null,
    transport_type: r['Type of transport'] || null,
    flight_train_number: r['Train/Flight number'] || null,
    ticket_purchase_date: parseDate(r['Ticket purchase date']),
    ticket_price: parseNum(r['Ticket Price']),
    departure_datetime: r['Departure date & time'] ? new Date(r['Departure date & time']).toISOString() : null,
    arrival_datetime: r['Arrival date & time'] ? new Date(r['Arrival date & time']).toISOString() : null,
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  const { error } = await supabase.from('travel_details').upsert(records, { onConflict: 'id' })
  if (error) console.error('Error importing travel_details:', error.message)
  else console.log(`  ✓ ${records.length} travel details imported`)
}

async function importFinancialInfo() {
  console.log('Importing Financial Info...')
  const rows = await parseCSV(`${CSV_DIR}/Financial info.csv`)

  const { data: partData } = await supabase.from('participants').select('id')
  const validPartIds = new Set((partData || []).map(r => r.id))

  const records = rows.map(r => ({
    id: r['_id'],
    participant_id: (r['Participants'] && validPartIds.has(r['Participants'])) ? r['Participants'] : null,
    international_transport_cost: parseNum(r['International Transport Cost']),
    local_transport_cost: parseNum(r['Local Transport Cost']),
    food_allowance_cost: parseNum(r['Food Allowance Cost']),
    insurance_cost: parseNum(r['Insurance Cost']),
    other_expenses: parseNum(r['Other Exepences Cost']),
    note_other_expenses: r['Note for Other Experiences Cost'] || null,
    accommodation_cost: parseNum(r['Accommodation']),
    accommodation_2_cost: parseNum(r['Accommodation 2']),
    transfer_cost: parseNum(r['Transfer Cost']),
    grant_amount: parseNum(r['Grant']),
    margin: parseNum(r['Margin']),
    language_course_cost: parseNum(r['Language Course Cost']),
    cultural_activities_cost: parseNum(r['Cultural Activities Cost']),
    created_at: r['_createdTime'] ? new Date(r['_createdTime']).toISOString() : null
  })).filter(r => r.id)

  const { error } = await supabase.from('financial_info').upsert(records, { onConflict: 'id' })
  if (error) console.error('Error importing financial_info:', error.message)
  else console.log(`  ✓ ${records.length} financial info records imported`)
}

async function main() {
  console.log('🚀 Starting Managemob data import...\n')

  // Import in dependency order
  await importSendingOrganisations()
  await importMobilityServiceProviders()
  await importLanguageCourseProviders()
  await importHostCompanies()
  await importInsuranceProviders()
  await importTransferProviders()
  await importAccommodation()
  await importParticipants()
  await importTravelDetails()
  await importFinancialInfo()

  console.log('\n✅ Import complete!')
}

main().catch(console.error)
