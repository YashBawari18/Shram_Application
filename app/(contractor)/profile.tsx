import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert,
} from 'react-native'
import { supabase } from '../../src/lib/supabase'
import { useAuthStore } from '../../src/stores/authStore'
import { signOut } from '../../src/lib/auth'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme'

export default function ContractorProfile() {
  const { session, profile, reset } = useAuthStore()
  const [contractorProfile, setContractorProfile] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, completed: 0 })

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    supabase.from('contractor_profiles').select('*').eq('id', uid).single()
      .then(({ data }) => setContractorProfile(data))

    supabase.from('instant_bookings')
      .select('status')
      .eq('contractor_id', uid)
      .then(({ data }) => {
        const all = data ?? []
        setStats({ total: all.length, completed: all.filter(b => b.status === 'completed').length })
      })
  }, [session])

  async function handleLogout() {
    Alert.alert('Logout', 'क्या आप logout करना चाहते हैं?', [
      { text: 'नहीं' },
      { text: 'हाँ', onPress: async () => { await signOut(); reset() } },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0) ?? 'C'}</Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          {contractorProfile?.company_name && (
            <Text style={styles.company}>🏗️ {contractorProfile.company_name}</Text>
          )}
          {contractorProfile?.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
          <Text style={styles.phone}>{profile?.phone}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatBox emoji="📋" value={String(stats.total)} label="कुल बुकिंग" />
          <StatBox emoji="✅" value={String(stats.completed)} label="पूरी हुईं" />
          <StatBox emoji="⭐" value={contractorProfile?.avg_rating > 0 ? contractorProfile.avg_rating.toFixed(1) : '—'} label="रेटिंग" />
        </View>

        {contractorProfile?.gst_number && (
          <View style={styles.gstCard}>
            <Text style={styles.gstLabel}>GST नंबर</Text>
            <Text style={styles.gstValue}>{contractorProfile.gst_number}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>सेटिंग्स</Text>
          <SettingsRow label="प्रोफ़ाइल एडिट करें" onPress={() => {}} />
          <SettingsRow label="Help & Support" onPress={() => {}} />
          <SettingsRow label="Logout" onPress={handleLogout} danger />
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

function StatBox({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function SettingsRow({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsRow}>
      <Text style={[styles.settingsLabel, danger && styles.danger]}>{label}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { padding: Spacing['2xl'], gap: Spacing.xl },
  hero: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.md },
  avatarText: { fontSize: 40, fontWeight: Typography.black, color: Colors.black },
  name: { fontSize: Typography['2xl'], fontWeight: Typography.black, color: Colors.black },
  company: { fontSize: Typography.base, color: Colors.textSecondary },
  phone: { fontSize: Typography.sm, color: Colors.textMuted },
  verifiedBadge: { backgroundColor: Colors.successLight, paddingHorizontal: Spacing.md, paddingVertical: 3, borderRadius: Radius.full },
  verifiedText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.success },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.black, color: Colors.black },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  gstCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.sm },
  gstLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  gstValue: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginTop: 4 },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.sm },
  settingsLabel: { fontSize: Typography.base, color: Colors.textPrimary },
  danger: { color: Colors.error },
  arrow: { fontSize: Typography.xl, color: Colors.textMuted },
})
