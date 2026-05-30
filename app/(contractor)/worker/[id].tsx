import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '../../../src/lib/supabase'
import { createBooking } from '../../../src/lib/booking'
import { useAuthStore } from '../../../src/stores/authStore'
import { getSkillLabel, SKILL_MAP } from '../../../src/constants/skills'
import { Button } from '../../../src/components/ui/Button'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme'
import { Skill } from '../../../src/types/app'

export default function WorkerDetailScreen() {
  const { id, hire } = useLocalSearchParams<{ id: string; hire?: string }>()
  const { session } = useAuthStore()
  const [worker, setWorker] = useState<any>(null)
  const [availability, setAvailability] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showHireSheet, setShowHireSheet] = useState(hire === '1')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [hiring, setHiring] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('worker_profiles').select('*').eq('id', id).single(),
      supabase.from('worker_availability').select('*').eq('worker_id', id).single(),
    ]).then(([p, wp, wa]) => {
      setWorker({ ...p.data, ...wp.data })
      setAvailability(wa.data)
      setLoading(false)
    })
  }, [id])

  async function handleHire() {
    if (!address.trim()) { Alert.alert('पता डालें', 'काम की जगह का पता ज़रूरी है।'); return }
    if (!session?.user?.id || !worker) return
    setHiring(true)

    const result = await createBooking({
      contractorId: session.user.id,
      workerId: id,
      agreedWage: availability?.today_wage ?? worker.daily_wage,
      skillRequired: worker.skill as Skill,
      workAddress: address.trim(),
      notes: notes.trim() || undefined,
    })

    setHiring(false)
    if (!result.success) { Alert.alert('Error', result.error ?? 'Booking failed'); return }

    Alert.alert('✓ Request Sent!', `${worker.name} को बुकिंग रिक्वेस्ट भेज दी गई है। 5 मिनट में जवाब मिलेगा।`,
      [{ text: 'ठीक है', onPress: () => router.back() }])
  }

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
    </SafeAreaView>
  )

  if (!worker) return null

  const wage = availability?.today_wage ?? worker.daily_wage
  const skill = SKILL_MAP[worker.skill as Skill]

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← वापस</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile hero */}
        <View style={styles.hero}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarInitial}>{worker.name?.charAt(0)}</Text>
          </View>
          {availability?.is_online && <View style={styles.onlineBadge}><Text style={styles.onlineBadgeText}>🟢 ऑनलाइन</Text></View>}
          <Text style={styles.workerName}>{worker.name}</Text>
          <Text style={styles.skillLabel}>{skill?.emoji} {getSkillLabel(worker.skill, 'hi')}</Text>
          <Text style={styles.location}>📍 {availability?.location_name ?? 'Location unavailable'}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox label="दिहाड़ी" value={`₹${wage.toLocaleString('en-IN')}`} sub="आज" />
          <StatBox label="रेटिंग" value={worker.avg_rating > 0 ? worker.avg_rating.toFixed(1) : 'New'} sub="⭐" />
          <StatBox label="कुल काम" value={String(worker.total_jobs)} sub="jobs" />
          <StatBox label="अनुभव" value={`${worker.experience_years}+`} sub="साल" />
        </View>

        {/* Hire form */}
        {showHireSheet ? (
          <View style={styles.hireCard}>
            <Text style={styles.hireTitle}>📋 बुकिंग रिक्वेस्ट भेजें</Text>
            <Text style={styles.hireWage}>दिहाड़ी: ₹{wage.toLocaleString('en-IN')} / दिन</Text>

            <Text style={styles.fieldLabel}>काम की जगह का पता *</Text>
            <TextInput
              style={styles.input}
              placeholder="जैसे: Plot 42, Sector 5, Panvel"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.fieldLabel}>काम की जानकारी (ऐच्छिक)</Text>
            <TextInput
              style={styles.input}
              placeholder="जैसे: 2 कमरों में पेंटिंग, सफेद रंग"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⏱ यह रिक्वेस्ट 5 मिनट में expire हो जाएगी</Text>
            </View>

            <Button label="✓ रिक्वेस्ट भेजें" onPress={handleHire} loading={hiring} />
            <Button label="रद्द करें" onPress={() => setShowHireSheet(false)} variant="ghost" style={{ marginTop: Spacing.sm }} />
          </View>
        ) : (
          <Button label={`${skill?.emoji ?? ''} अभी Hire करें — ₹${wage.toLocaleString('en-IN')}/दिन`} onPress={() => setShowHireSheet(true)} style={styles.hireCta} />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  backBtn: {},
  backText: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.medium },
  scroll: { padding: Spacing['2xl'], gap: Spacing.xl },
  hero: { alignItems: 'center', gap: Spacing.sm },
  avatarLg: { width: 88, height: 88, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', ...Shadow.md },
  avatarInitial: { fontSize: 40, fontWeight: Typography.bold, color: Colors.black },
  onlineBadge: { backgroundColor: Colors.successLight, paddingHorizontal: Spacing.md, paddingVertical: 3, borderRadius: Radius.full },
  onlineBadgeText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.success },
  workerName: { fontSize: Typography['2xl'], fontWeight: Typography.black, color: Colors.black },
  skillLabel: { fontSize: Typography.base, color: Colors.textSecondary },
  location: { fontSize: Typography.sm, color: Colors.textMuted },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.offWhite, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: Typography.lg, fontWeight: Typography.black, color: Colors.black },
  statSub: { fontSize: Typography.xs, color: Colors.textMuted },
  statLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  hireCard: { backgroundColor: Colors.offWhite, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md, borderWidth: 1.5, borderColor: Colors.primary },
  hireTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.black },
  hireWage: { fontSize: Typography.base, color: Colors.textSecondary },
  fieldLabel: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
  input: { backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary, minHeight: 48 },
  warningBox: { backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: Spacing.md },
  warningText: { fontSize: Typography.sm, color: Colors.warning },
  hireCta: { marginTop: Spacing.sm },
})
