/**
 * Shram Design System
 * Theme: Yellow + Black + White
 * Inspired by: Rapido Captain, Blinkit, Uber
 */
export const Colors = {
  // Brand
  primary: '#F5C518',       // Shram Yellow — main CTA, online badge
  primaryDark: '#D4A800',   // Pressed state
  primaryLight: '#FFF3B0',  // Backgrounds, highlights

  black: '#0A0A0A',
  white: '#FFFFFF',
  offWhite: '#F8F8F6',

  // Text
  textPrimary: '#0A0A0A',
  textSecondary: '#6B6B6B',
  textMuted: '#A0A0A0',
  textOnYellow: '#0A0A0A',  // Black text on yellow bg

  // Semantic
  success: '#1DB954',
  successLight: '#E8F8EE',
  error: '#E53E3E',
  errorLight: '#FEF2F2',
  warning: '#F5A623',
  warningLight: '#FFF8E6',
  info: '#2B6CB0',
  infoLight: '#EBF4FF',

  // Surfaces
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F3',
  border: '#E8E8E6',
  borderLight: '#F0F0EE',

  // Online/Offline
  online: '#1DB954',
  offline: '#A0A0A0',
} as const

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,

  // Weights (React Native uses string)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
} as const

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const
