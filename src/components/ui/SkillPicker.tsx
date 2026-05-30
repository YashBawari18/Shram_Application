import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SKILLS } from '../../constants/skills'
import { Skill } from '../../types/app'
import { Colors, Typography, Spacing, Radius } from '../../constants/theme'

interface SkillPickerProps {
  selected: Skill | null
  onSelect: (skill: Skill) => void
  label?: string
  error?: string
}

export function SkillPicker({ selected, onSelect, label, error }: SkillPickerProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.grid}>
        {SKILLS.map((skill) => {
          const isSelected = selected === skill.key
          return (
            <TouchableOpacity
              key={skill.key}
              onPress={() => onSelect(skill.key)}
              activeOpacity={0.75}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={styles.emoji}>{skill.emoji}</Text>
              <Text style={[styles.labelHi, isSelected && styles.labelHiSelected]}>
                {skill.label_hi}
              </Text>
              <Text style={[styles.labelEn, isSelected && styles.labelEnSelected]}>
                {skill.label_en}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    gap: 4,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  emoji: { fontSize: 28 },
  labelHi: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  labelHiSelected: { color: Colors.black },
  labelEn: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  labelEnSelected: { color: Colors.textSecondary },
  error: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
})
