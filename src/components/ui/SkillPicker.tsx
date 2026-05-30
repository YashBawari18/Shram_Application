import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SKILLS } from '../../constants/skills'
import { Skill } from '../../types/app'
import { Colors, Typography, Spacing, Radius } from '../../design/theme';

const SKILL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  painter: 'brush-outline',
  helper: 'hammer-outline',
  mason: 'business-outline',
  electrician: 'flash-outline',
  plumber: 'water-outline',
  carpenter: 'construct-outline',
  tile_worker: 'grid-outline',
  welder: 'flame-outline',
  construction_laborer: 'build-outline',
}

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
              <Ionicons
                name={SKILL_ICONS[skill.key] || 'construct-outline'}
                size={26}
                color={isSelected ? Colors.white : Colors.primary}
              />
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
    backgroundColor: Colors.primary,
  },
  labelHi: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  labelHiSelected: { color: Colors.white },
  labelEn: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  labelEnSelected: { color: Colors.border },
  error: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
})
