import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false, // Prevent swipe-back out of onboarding
      }}
    />
  )
}
