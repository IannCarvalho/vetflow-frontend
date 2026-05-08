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
