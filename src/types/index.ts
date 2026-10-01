/**
 * VetFlow Type Definitions
 *
 * All TypeScript interfaces for the VetFlow veterinary management system.
 * Data structures aligned with the Go backend API.
 */

/**
 * Client interface - Represents a veterinary clinic client (pet owner)
 *
 * @property id - Unique identifier from database
 * @property full_name - Complete name of the client
 * @property cpf - Brazilian CPF (Cadastro de Pessoas Físicas)
 * @property phone - Contact phone number
 * @property address - Full address information
 * @property created_at - ISO timestamp of creation
 * @property updated_at - ISO timestamp of last update
 */
export interface Client {
  id: string;
  full_name: string;
  cpf: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    zip_code: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Pet interface - Represents a patient pet
 *
 * @property id - Unique identifier
 * @property name - Pet name
 * @property species - Animal species (e.g., "Cachorro", "Gato")
 * @property breed - Breed information (optional)
 * @property age - Numeric age value
 * @property age_unit - Unit of age measurement
 * @property sex - Biological sex
 * @property neutered - Neutering/spaying status
 * @property weight - Weight in kilograms
 * @property owner_id - Reference to Client
 * @property created_at - ISO timestamp
 * @property updated_at - ISO timestamp
 */
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age: number;
  age_unit: 'months' | 'years';
  sex: 'male' | 'female';
  neutered: boolean;
  weight: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Consultation interface - Represents a veterinary consultation record
 *
 * @property id - Unique identifier
 * @property pet_id - Reference to Pet
 * @property vet_name - Name of veterinarian performing the consultation
 * @property date - ISO date of consultation
 * @property return_date - ISO date of recommended return (optional)
 * @property anamnesis - Patient history information
 * @property diet - Dietary information
 * @property physiological - Physical functions status
 * @property summary - Consultation summary
 * @property created_at - ISO timestamp
 */
export interface Consultation {
  id: string;
  pet_id: string;
  date: string;
  return_date?: string;
  anamnesis: {
    main_complaint: string;
    evolution_time: string;
    symptoms_worsened: boolean;
    symptom_frequency: string;
    behavior_change: boolean;
    pain: boolean;
    happened_before: boolean;
    prior_vet_visit: boolean;
  };
  diet: {
    food_type: string;
    amount_and_frequency: string;
    diet_changed_recently: boolean;
    normal_water_intake: boolean;
  };
  physiological: {
    normal_urine_feces: boolean;
    vomiting: boolean;
    respiratory_issues: boolean;
  };
  summary: {
    main_complaint: string;
    evolution_time: string;
    feeding: string;
    feces_urine: string;
    vaccines_and_deworming: string;
    medications: string;
    environment_and_contacts: string;
  };
  created_at: string;
}

/**
 * Vaccine interface - Represents a pet vaccination record
 *
 * @property id - Unique identifier
 * @property pet_id - Reference to Pet
 * @property vaccine_name - Name of the vaccine applied
 * @property batch - Vaccine batch number (optional)
 * @property manufacturer - Vaccine manufacturer (optional)
 * @property date_applied - ISO date of application
 * @property next_dose_date - ISO date of next scheduled dose (optional)
 * @property notes - Additional notes (optional)
 * @property created_at - ISO timestamp
 */
export interface Vaccine {
  id: string;
  pet_id: string;
  vaccine_name: string;
  batch?: string;
  manufacturer?: string;
  date_applied: string;
  next_dose_date?: string;
  notes?: string;
  created_at: string;
}

/**
 * Prescription item - a single medication line in a prescription
 */
export interface PrescriptionItem {
  medication: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
}

/**
 * Prescription interface - Represents a veterinary prescription (receituário)
 *
 * @property id - Unique identifier
 * @property pet_id - Reference to Pet
 * @property consultation_id - Reference to a Consultation (optional)
 * @property date - ISO date of the prescription
 * @property items - Medication lines
 * @property general_notes - Free-form notes shown at the bottom of the receituário
 * @property created_at - ISO timestamp
 * @property updated_at - ISO timestamp
 */
export interface Prescription {
  id: string;
  pet_id: string;
  consultation_id?: string;
  date: string;
  items: PrescriptionItem[];
  general_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Catalog item type - service or stockable product
 */
export type CatalogItemType = 'service' | 'product';

/**
 * CatalogItem interface - a billable service or a stockable product
 *
 * @property id - Unique identifier
 * @property type - 'service' or 'product'
 * @property name - Item name
 * @property description - Optional description
 * @property price - Unit price
 * @property unit - Unit label (un, ml, cx...)
 * @property stock_quantity - Current stock (products only)
 * @property min_stock - Minimum-stock threshold (products only)
 * @property active - Whether the item is active/available
 * @property created_at - ISO timestamp
 * @property updated_at - ISO timestamp
 */
export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  stock_quantity: number;
  min_stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Invoice payment status and method - aligned with the Go backend (models/invoice.go)
 */
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'canceled';

export type PaymentMethod = '' | 'cash' | 'card' | 'pix' | 'transfer' | 'boleto';

/**
 * Invoice item - a single billable line
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

/**
 * Invoice interface - Represents a billing document (financeiro)
 *
 * @property id - Unique identifier
 * @property client_id - Reference to Client
 * @property pet_id - Reference to Pet (optional)
 * @property consultation_id - Reference to Consultation (optional)
 * @property items - Billable line items
 * @property subtotal - Sum of item totals (server-computed)
 * @property discount - Discount applied
 * @property total - Final amount (server-computed)
 * @property status - Payment status
 * @property method - Payment method (optional)
 * @property issue_date - ISO date the invoice was issued
 * @property due_date - ISO due date (optional)
 * @property paid_at - ISO timestamp when marked paid (optional)
 * @property notes - Additional notes
 * @property created_at - ISO timestamp
 * @property updated_at - ISO timestamp
 */
export interface Invoice {
  id: string;
  client_id: string;
  pet_id?: string;
  consultation_id?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  issue_date: string;
  due_date?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Appointment types and statuses - aligned with the Go backend (models/appointment.go)
 */
export type AppointmentType =
  | 'consultation'
  | 'vaccine'
  | 'return'
  | 'surgery'
  | 'exam'
  | 'grooming'
  | 'other';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

/**
 * Appointment interface - Represents a scheduled visit in the agenda/calendar
 *
 * @property id - Unique identifier
 * @property pet_id - Reference to Pet
 * @property client_id - Reference to Client (optional)
 * @property title - Short label for the appointment
 * @property type - Kind of appointment
 * @property status - Lifecycle status
 * @property start_time - ISO timestamp of the appointment start
 * @property end_time - ISO timestamp of the appointment end (optional)
 * @property notes - Additional notes (optional)
 * @property created_at - ISO timestamp
 * @property updated_at - ISO timestamp
 */
export interface Appointment {
  id: string;
  pet_id: string;
  client_id?: string;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  start_time: string;
  end_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * API Response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Dashboard summary statistics
 */
export interface DashboardStats {
  total_clients: number;
  total_pets: number;
  consultations_this_month: number;
  upcoming_vaccinations: number;
}
