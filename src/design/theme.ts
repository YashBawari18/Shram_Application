export const theme = {
  colors: {
    background: '#FAFAF8',
    primary: '#0B1220', // brand primary
    primaryDark: '#091119', // darker shade for pressed state
    primaryLight: '#E8EEF5', // premium ice-blue soft light slate background variant
    accent: '#22C55E', // secondary accent color
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F3', // secondary surface used in cards, inputs
    surfaceDark: '#1F2937',
    border: '#E5E7EB', // border color for inputs, dividers
    borderLight: '#F0F0EE', // lighter border used in some components
    text: '#111827',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textOnYellow: '#111827', // legacy alias
    muted: '#6B7280',
    success: '#16A34A',
    successLight: '#E8F8EE',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    warning: '#F59E0B',
    warningLight: '#FFF8E6',
    info: '#3B82F6',
    infoLight: '#EBF4FF',
    online: '#10B981',
    offline: '#6B7280',
    white: '#FFFFFF',
    black: '#000000',
    offWhite: '#F8F8F6',
  },
  spacing: (factor: number) => factor * 8,
  radius: 24, // base radius for xl corners
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 4,
    },
  },
  typography: {
    // Numeric scale used throughout components
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    // Font weights (React Native expects string values)
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
    // Named variants for headings, etc.
    titleXL: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
    titleL: { fontSize: 24, fontWeight: '600' as const, lineHeight: 30 },
    bodyM: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
    caption: { fontSize: 12, fontWeight: '300' as const, lineHeight: 16 },
  },
};

// Token aliases for easy import
export const Colors = theme.colors;
export const Typography = theme.typography;
export const Spacing = {
  xs: theme.spacing(0.5),
  base: theme.spacing(2),
  sm: theme.spacing(1),
  md: theme.spacing(2),
  lg: theme.spacing(3),
  xl: theme.spacing(4),
  '2xl': theme.spacing(5),
  '3xl': theme.spacing(6),
  '4xl': theme.spacing(8),
};
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: theme.radius,
  full: 9999,
};
export const Shadow = theme.shadow;
