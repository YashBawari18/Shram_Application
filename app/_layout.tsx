import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { useAuthStore, initializeAuth } from '../src/stores/authStore'

/**
 * Route guard. Runs on every navigation and after auth state changes.
 * This is the SINGLE place that decides where the user goes.
 */
function RouteGuard() {
  const { session, profile, isInitialized } = useAuthStore()
  const segments = useSegments()

  useEffect(() => {
    if (!isInitialized) return

    const inAuthGroup = segments[0] === '(auth)'
    const inOnboarding = segments[0] === '(onboarding)'

    // Not logged in → auth screens
    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/login')
      return
    }

    // Logged in but no profile or role not set → role selection
    if (!profile || !profile.role) {
      if (!inOnboarding) router.replace('/(onboarding)/role-select')
      return
    }

    // Logged in but onboarding not complete → onboarding flow
    if (!profile.onboarding_complete) {
      const isOnRoleSelect = segments[1] === 'role-select'
      if (!inOnboarding || isOnRoleSelect) {
        // -----------------------------------------------------------------
        // NEW: make sure we never call router.replace(undefined)
        // -----------------------------------------------------------------
        let route: string
        if (profile.role === 'worker') {
          route = '/(onboarding)/worker-onboard'
        } else if (profile.role === 'contractor') {
          route = '/(onboarding)/contractor-onboard'
        } else {
          // If the role is missing or corrupted, send the user back to the
          // role‑selection screen – that route definitely exists.
          route = '/(onboarding)/role-select'
        }
        router.replace(route)
        // -----------------------------------------------------------------
      }
      return
    }

    // Fully onboarded → main app. Redirect from other groups to correct home.
    const inWorkerGroup = segments[0] === '(worker)'
    const inContractorGroup = segments[0] === '(contractor)'

    if (profile.onboarding_complete) {
      const correctGroup = profile.role === 'worker' ? inWorkerGroup : inContractorGroup
      if (!correctGroup) {
        const home = profile.role === 'worker'
          ? '/(worker)/home'
          : '/(contractor)/home'
        router.replace(home)
      }
      return
    }
  }, [session, profile, isInitialized, segments])

  return null
}

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = initializeAuth()
    return unsubscribe
  }, [])

  return (
    <>
      <RouteGuard />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
