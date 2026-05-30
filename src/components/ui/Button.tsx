import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { Colors, Typography, Spacing, Radius } from '../../constants/theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.textOnYellow : Colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  variant_primary: {
    backgroundColor: Colors.primary,
  },
  variant_secondary: {
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: Colors.error,
  },

  // Sizes
  size_sm: { height: 36, paddingHorizontal: Spacing.md },
  size_md: { height: 44, paddingHorizontal: Spacing.lg },
  size_lg: { height: 54, paddingHorizontal: Spacing.xl },

  // Labels
  label: {
    fontWeight: Typography.bold,
    letterSpacing: 0.3,
  },
  label_primary: { color: Colors.textOnYellow },
  label_secondary: { color: Colors.textPrimary },
  label_ghost: { color: Colors.primary },
  label_danger: { color: Colors.white },

  labelSize_sm: { fontSize: Typography.sm },
  labelSize_md: { fontSize: Typography.base },
  labelSize_lg: { fontSize: Typography.md },
})
