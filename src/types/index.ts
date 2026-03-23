export interface Participant {
  id: string
  name: string | null
  surname: string | null
  sex: string | null
  status: string | null
  date_of_birth: string | null
  place_of_birth: string | null
  nationality: string | null
  marital_status: string | null
  email: string | null
  phone: string | null
  mobile_phone: string | null
  address: string | null
  postcode: string | null
  city: string | null
  country: string | null
  passport_number: string | null
  passport_expiring_date: string | null
  driving_licence: string | null
  passport_scan_url: string | null
  lang_english: string | null
  lang_spanish: string | null
  lang_french: string | null
  lang_german: string | null
  lang_italian: string | null
  lang_other: string | null
  language_test_validated: string | null
  language_test_score: string | null
  language_test_certificate: string | null
  last_diploma: string | null
  year_obtained: string | null
  diploma_certificate: string | null
  swift_code: string | null
  iban: string | null
  mobility_typology: string | null
  arrival_departure: string | null
  indiv_group: string | null
  destination_country: string | null
  destination_city: string | null
  arrival_date: string | null
  departure_date: string | null
  language_course_start_date: string | null
  language_course_end_date: string | null
  language_course_weeks: number | null
  internship_start_date: string | null
  internship_end_date: string | null
  internship_weeks: number | null
  group_name: string | null
  project_name: string | null
  program: string | null
  grant_amount: number | null
  international_transport_cost: number | null
  local_transport_cost: number | null
  food_allowance_cost: number | null
  insurance_cost: number | null
  other_expenses: number | null
  note_other_expenses: string | null
  accommodation_1_cost: number | null
  accommodation_2_cost: number | null
  transfer_cost: number | null
  accommodation_1_start_date: string | null
  accommodation_1_end_date: string | null
  accommodation_1_weeks: number | null
  accommodation_2_start_date: string | null
  accommodation_2_end_date: string | null
  accommodation_2_weeks: number | null
  id_name: string | null
  id_formattato: string | null
  record_number: number | null
  sending_organisation_id: string | null
  host_company_id: string | null
  insurance_provider_id: string | null
  transfer_provider_id: string | null
  mobility_service_provider_id: string | null
  language_course_provider_id: string | null
  accommodation_1_id: string | null
  accommodation_2_id: string | null
  created_at: string | null
  // Joined data
  sending_organisations?: SendingOrganisation
  host_companies?: HostCompany
  insurance_providers?: InsuranceProvider
  transfer_providers?: TransferProvider
  language_course_providers?: LanguageCourseProvider
  accommodation_1?: Accommodation
  accommodation_2?: Accommodation
}

export interface SendingOrganisation {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  created_at: string | null
}

export interface MobilityServiceProvider {
  id: string
  name: string
  pic_number: string | null
  address: string | null
  postcode: string | null
  city: string | null
  country: string | null
  website: string | null
  email: string | null
  phone: string | null
  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_comments: string | null
  num_offices: number | null
  num_employees: number | null
  placement_capacity: number | null
  placement_fees: string | null
  geographic_area: string | null
  specialty_1: string | null
  specialty_2: string | null
  specialty_3: string | null
  notes: string | null
  created_at: string | null
}

export interface LanguageCourseProvider {
  id: string
  name: string
  address: string | null
  city: string | null
  country: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  language_taught: string | null
  created_at: string | null
}

export interface HostCompany {
  id: string
  name: string
  address: string | null
  city: string | null
  sector: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  tutor: string | null
  tutor_phone: string | null
  tutor_email: string | null
  mobility_service_provider_id: string | null
  created_at: string | null
}

export interface InsuranceProvider {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  notes: string | null
  status: string | null
  created_at: string | null
}

export interface TransferProvider {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  normal_price: number | null
  notes: string | null
  created_at: string | null
}

export interface Accommodation {
  id: string
  name: string
  typology: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  mobile_phone: string | null
  address: string | null
  postcode: string | null
  city: string | null
  country: string | null
  num_bedrooms: number | null
  size_m2: number | null
  has_desk: boolean | null
  has_internet: boolean | null
  has_washing_machine: boolean | null
  bathrooms_type: string | null
  has_pets: boolean | null
  has_air_conditioning: boolean | null
  has_heating: boolean | null
  board_option_1: string | null
  price_week_option_1: number | null
  board_option_2: string | null
  price_week_option_2: number | null
  board_option_3: string | null
  price_week_option_3: number | null
  iban: string | null
  swift: string | null
  family_rules: string | null
  comments: string | null
  created_at: string | null
}

export interface TravelDetail {
  id: string
  participant_id: string | null
  transport_type: string | null
  flight_train_number: string | null
  ticket_purchase_date: string | null
  ticket_price: number | null
  departure_datetime: string | null
  arrival_datetime: string | null
  created_at: string | null
}

export interface FinancialInfo {
  id: string
  participant_id: string | null
  international_transport_cost: number | null
  local_transport_cost: number | null
  food_allowance_cost: number | null
  insurance_cost: number | null
  other_expenses: number | null
  note_other_expenses: string | null
  accommodation_cost: number | null
  accommodation_2_cost: number | null
  transfer_cost: number | null
  grant_amount: number | null
  margin: number | null
  language_course_cost: number | null
  cultural_activities_cost: number | null
  created_at: string | null
}
