import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { setUserRole } from '../../src/lib/auth'
import { useAuthStore } from '../../src/stores/authStore'
import { UserRole } from '../../src/types/app'
import { Button } from '../../src/components/ui/Button'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme'
import { Ionicons } from '@expo/vector-icons'

export default function RoleSelectScreen() {
  const { session, loadProfile } = useAuthStore()
  const [selected, setSelected] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!selected || !session?.user) return
    setLoading(true)

    const result = await setUserRole(session.user.id, selected)
    if (!result.success) {
      Alert.alert('Error', result.error)
      setLoading(false)
      return
    }

    await loadProfile() // This triggers RouteGuard → onboarding
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>श्रम</Text>
          </View>
          <Text style={styles.title}>आप कौन हैं?</Text>
          <Text style={styles.subtitle}>
            अपना काम चुनें — आप मज़दूर हैं या ठेकेदार?
          </Text>
        </View>

        <View style={styles.cards}>
          <RoleCard
            role="worker"
            selected={selected === 'worker'}
            onSelect={() => setSelected('worker')}
            iconName="person-outline"
            title="मज़दूर हूं"
            titleEn="Worker"
            description="मुझे रोज़ काम चाहिए\nपेंटर, मिस्त्री, हेल्पर..."
          />
          <RoleCard
            role="contractor"
            selected={selected === 'contractor'}
            onSelect={() => setSelected('contractor')}
            iconName="business-outline"
            title="ठेकेदार हूं"
            titleEn="Contractor / Hirer"
            description="मुझे मज़दूर चाहिए\nसाइट सुपरवाइज़र, बिल्डर..."
          />
        </View>

        <Button
          label="आगे बढ़ें"
          onPress={handleContinue}
          loading={loading}
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  )
}

interface RoleCardProps {
  role: UserRole
  selected: boolean
  onSelect: () => void
  iconName: keyof typeof Ionicons.glyphMap
  title: string
  titleEn: string
  description: string
}

function RoleCard({ selected, onSelect, iconName, title, titleEn, description }: RoleCardProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.85}
      style={[styles.card, selected && styles.cardSelected]}
    >
      {selected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={16} color={Colors.white} />
        </View>
      )}
      <Ionicons name={iconName} size={48} color={selected ? Colors.primary : Colors.textMuted} style={{ marginBottom: Spacing.md }} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardTitleEn}>{titleEn}</Text>
      <Text style={styles.cardDesc}>{description}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    justifyContent: 'space-between',
  },

  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  logoText: {
    fontSize: 28,
    fontWeight: Typography.black,
    color: Colors.white,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.base * 1.5,
  },

  cards: {
    flexDirection: 'row',
    gap: Spacing.base,
    flex: 1,
    alignItems: 'center',
  },
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    padding: Spacing.xl,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
    ...Shadow.sm,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  checkBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 16, fontWeight: Typography.bold, color: Colors.white },

  cardEmoji: { fontSize: 48, marginBottom: Spacing.md },
  cardTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  cardTitleEn: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sm * 1.6,
  },
})
