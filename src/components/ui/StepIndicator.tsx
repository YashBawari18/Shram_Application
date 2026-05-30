import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors, Typography, Spacing, Radius } from '../../design/theme';

interface StepIndicatorProps {
  current: number
  total: number
  labels?: string[]
}

export function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={[
              styles.dot,
              i < current && styles.dotDone,
              i === current && styles.dotActive,
            ]}>
              {i < current && <Text style={styles.check}>✓</Text>}
              {i === current && <View style={styles.dotInner} />}
            </View>
            {i < total - 1 && (
              <View style={[styles.line, i < current && styles.lineDone]} />
            )}
          </View>
        ))}
      </View>
      {labels && labels[current] && (
        <Text style={styles.label}>{labels[current]}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: Spacing.xl },
  dots: { flexDirection: 'row', alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  dotDone: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  check: { fontSize: 13, fontWeight: Typography.bold, color: Colors.white },
  line: { width: 32, height: 2, backgroundColor: Colors.border, marginHorizontal: 2 },
  lineDone: { backgroundColor: Colors.primary },
  label: {
    marginTop: Spacing.sm,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
})
