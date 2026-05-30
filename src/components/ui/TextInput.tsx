import React, { useState } from 'react'
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native'
import { Colors, Typography, Spacing, Radius } from '../../constants/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  prefix?: string       // e.g. "+91" for phone
  suffix?: React.ReactNode
  hint?: string
}

export function TextInput({ label, error, prefix, suffix, hint, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[
        styles.inputRow,
        focused && styles.focused,
        error ? styles.errorBorder : null,
      ]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}

        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {suffix && <View style={styles.suffix}>{suffix}</View>}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.base },

  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    height: 54,
  },
  focused: { borderColor: Colors.primary, backgroundColor: Colors.white },
  errorBorder: { borderColor: Colors.error },

  prefix: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
    fontWeight: Typography.medium,
  },

  input: {
    flex: 1,
    fontSize: Typography.md,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
    padding: 0,
  },

  suffix: { marginLeft: Spacing.sm },

  error: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  hint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
})
