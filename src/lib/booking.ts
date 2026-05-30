import { supabase } from './supabase'
import { Skill } from '../types/app'

export interface CreateBookingPayload {
  contractorId: string
  workerId: string
  agreedWage: number
  skillRequired: Skill
  workAddress: string
  notes?: string
}

export async function createBooking(payload: CreateBookingPayload) {
  const { data, error } = await supabase
    .from('instant_bookings')
    .insert({
      contractor_id: payload.contractorId,
      worker_id: payload.workerId,
      agreed_wage: payload.agreedWage,
      skill_required: payload.skillRequired,
      work_address: payload.workAddress,
      notes: payload.notes ?? null,
      status: 'pending',
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message, data: null }
  return { success: true, error: null, data }
}

export async function fetchBookingWithProfiles(bookingId: string) {
  const { data, error } = await supabase
    .from('instant_bookings')
    .select(`
      *,
      worker:profiles!instant_bookings_worker_id_fkey(id, name, avatar_url, phone),
      contractor:profiles!instant_bookings_contractor_id_fkey(id, name, avatar_url, phone)
    `)
    .eq('id', bookingId)
    .single()

  if (error) return null
  return data
}

export async function markJobStarted(bookingId: string) {
  return supabase
    .from('instant_bookings')
    .update({ status: 'started', updated_at: new Date().toISOString() })
    .eq('id', bookingId)
}

export async function markJobCompleted(bookingId: string) {
  return supabase
    .from('instant_bookings')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', bookingId)
}
