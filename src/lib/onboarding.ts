import { supabase } from './supabase'
import { Skill } from '../types/app'

export interface WorkerOnboardingData {
  name: string
  skill: Skill
  skills_extra: Skill[]
  experience_years: number
  daily_wage: number
  preferred_language: 'hi' | 'mr' | 'en'
}

export interface ContractorOnboardingData {
  name: string
  company_name: string
  gst_number: string
  preferred_language: 'hi' | 'mr' | 'en'
}

export interface OnboardResult {
  success: boolean
  error?: string
}

/**
 * Saves worker onboarding data and marks onboarding complete.
 * Two writes wrapped in sequence — profiles update + worker_profiles upsert.
 */
export async function completeWorkerOnboarding(
  userId: string,
  data: WorkerOnboardingData
): Promise<OnboardResult> {
  // 1. Update base profile — name, language, onboarding_complete
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name: data.name.trim(),
      preferred_language: data.preferred_language,
      onboarding_complete: true,
    })
    .eq('id', userId)

  if (profileError) return { success: false, error: profileError.message }

  // 2. Upsert worker_profiles row
  const { error: workerError } = await supabase
    .from('worker_profiles')
    .upsert({
      id: userId,
      skill: data.skill,
      skills_extra: data.skills_extra,
      experience_years: data.experience_years,
      daily_wage: data.daily_wage,
    })

  if (workerError) return { success: false, error: workerError.message }

  // 3. Create initial availability row (offline by default)
  const { error: availError } = await supabase
    .from('worker_availability')
    .upsert({
      worker_id: userId,
      is_online: false,
      today_wage: data.daily_wage,
    }, { onConflict: 'worker_id' })

  if (availError) return { success: false, error: availError.message }

  return { success: true }
}

/**
 * Saves contractor onboarding data and marks onboarding complete.
 */
export async function completeContractorOnboarding(
  userId: string,
  data: ContractorOnboardingData
): Promise<OnboardResult> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name: data.name.trim(),
      preferred_language: data.preferred_language,
      onboarding_complete: true,
    })
    .eq('id', userId)

  if (profileError) return { success: false, error: profileError.message }

  const { error: contractorError } = await supabase
    .from('contractor_profiles')
    .upsert({
      id: userId,
      company_name: data.company_name.trim() || null,
      gst_number: data.gst_number.trim() || null,
    })

  if (contractorError) return { success: false, error: contractorError.message }

  return { success: true }
}
