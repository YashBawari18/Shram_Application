import { supabase } from './supabase'
import { phoneToEmail } from '../utils/phoneEmail'
import { UserRole } from '../types/app'

export interface AuthResult {
  success: boolean
  error?: string
}

/**
 * Sign up a new user.
 * Creates the Supabase auth user. Profile row is created
 * via a Supabase trigger (handle_new_user) — see migration.
 */
export async function signUp(phone: string, password: string): Promise<AuthResult> {
  const email = phoneToEmail(phone)

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Store the real phone number in metadata so the trigger can use it
      data: { phone },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'This number is already registered. Please log in.' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Log in an existing user.
 */
export async function signIn(phone: string, password: string): Promise<AuthResult> {
  const email = phoneToEmail(phone)

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: 'Incorrect number or password. Please try again.' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Sign out and clear session.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * Fetch the profile row for the currently authenticated user.
 * Returns null if not found (triggers onboarding).
 */
export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

/**
 * Set the user's role during role selection screen.
 * Called once, right after initial sign-up.
 */
export async function setUserRole(userId: string, role: UserRole): Promise<AuthResult> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
