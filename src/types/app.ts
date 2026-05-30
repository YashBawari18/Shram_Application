// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = 'worker' | 'contractor'

// ─── Skills ───────────────────────────────────────────────────────────────────
export type Skill =
  | 'painter'
  | 'helper'
  | 'mason'
  | 'electrician'
  | 'plumber'
  | 'carpenter'
  | 'tile_worker'
  | 'welder'
  | 'construction_laborer'

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  phone: string
  role: UserRole | null
  name: string | null
  avatar_url: string | null
  onboarding_complete: boolean
  preferred_language: 'hi' | 'mr' | 'en'
  created_at: string
}

// ─── Worker ───────────────────────────────────────────────────────────────────
export interface WorkerProfile {
  id: string
  skill: Skill
  skills_extra: Skill[]
  experience_years: number
  daily_wage: number
  bio: string | null
  avg_rating: number
  total_jobs: number
}

export interface WorkerAvailability {
  id: string
  worker_id: string
  is_online: boolean
  location: { lat: number; lng: number } | null
  location_name: string | null
  today_wage: number
  available_from: string | null
  updated_at: string
}

// ─── Contractor ───────────────────────────────────────────────────────────────
export interface ContractorProfile {
  id: string
  company_name: string | null
  gst_number: string | null
  verified: boolean
  avg_rating: number
  total_hires: number
}

// ─── Booking ──────────────────────────────────────────────────────────────────
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'started'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export interface InstantBooking {
  id: string
  contractor_id: string
  worker_id: string
  status: BookingStatus
  agreed_wage: number
  skill_required: Skill
  work_address: string
  work_date: string
  notes: string | null
  expires_at: string
  created_at: string
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export interface Message {
  id: string
  booking_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
}

// ─── Nearby worker (joined query result) ──────────────────────────────────────
export interface NearbyWorker {
  worker_id: string
  name: string
  avatar_url: string | null
  skill: Skill
  today_wage: number
  avg_rating: number
  total_jobs: number
  distance_km: number
  location_name: string | null
}
