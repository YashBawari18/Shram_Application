import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { Profile } from '../types/app'
import { supabase } from '../lib/supabase'
import { fetchProfile } from '../lib/auth'

interface AuthState {
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  loadProfile: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: false,
  isInitialized: false,

  setSession: (session) => set({ session }),

  setProfile: (profile) => set({ profile }),

  loadProfile: async () => {
    const { session } = get()
    if (!session?.user) {
      set({ isInitialized: true })
      return
    }

    set({ isLoading: true })
    const profile = await fetchProfile(session.user.id)
    set({ profile, isLoading: false, isInitialized: true })
  },

  reset: () => set({
    session: null,
    profile: null,
    isLoading: false,
    isInitialized: false,
  }),
}))

/**
 * Initialize auth by listening to Supabase session changes.
 * Call this ONCE from the root _layout.tsx.
 */
export function initializeAuth() {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session)
    useAuthStore.getState().loadProfile()
  })

  // Listen for auth changes (login, logout, token refresh)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      useAuthStore.getState().setSession(session)

      if (event === 'SIGNED_IN') {
        await useAuthStore.getState().loadProfile()
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().reset()
        useAuthStore.setState({ isInitialized: true })
      }
    }
  )

  return () => subscription.unsubscribe()
}
