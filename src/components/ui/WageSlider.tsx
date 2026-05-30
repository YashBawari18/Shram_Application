import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Slider from '@react-native-community/slider'
import { Colors, Typography, Spacing, Radius } from '../../design/theme';

interface WageSliderProps {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
}

export function WageSlider({
  value,
  onChange,
  min = 300,
  max = 2000,
  step = 50,
  label,
}: WageSliderProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Big wage display */}
      <View style={styles.display}>
        <Text style={styles.rupee}>₹</Text>
        <Text style={styles.amount}>{value.toLocaleString('en-IN')}</Text>
        <Text style={styles.perDay}>/दिन</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={Colors.primary}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={Colors.primary}
      />

      <View style={styles.range}>
        <Text style={styles.rangeLabel}>₹{min.toLocaleString('en-IN')}</Text>
        <Text style={styles.rangeLabel}>₹{max.toLocaleString('en-IN')}</Text>
      </View>

      {/* Market hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>
          💡 औसत दिहाड़ी: पेंटर ₹700–900 • मिस्त्री ₹800–1200 • हेल्पर ₹500–700
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.base },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  display: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  rupee: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  amount: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.black,
    color: Colors.white,
  },
  perDay: {
    fontSize: Typography.base,
    color: Colors.border,
    fontWeight: Typography.medium,
  },
  slider: { width: '100%', height: 40 },
  range: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -Spacing.sm,
  },
  rangeLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  hint: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  hintText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.xs * 1.6,
  },
})
