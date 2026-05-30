import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabase'
import { useAuthStore } from '../../src/stores/authStore'
import { signOut } from '../../src/lib/auth'
import { getSkillLabel } from '../../src/constants/skills'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme'

export default function WorkerProfile() {
  const { session, profile, reset } = useAuthStore()
  const [workerProfile, setWorkerProfile] = useState<any>(null)
  const [recentJobs, setRecentJobs] = useState<any[]>([])
  const [recentRatings, setRecentRatings] = useState<any[]>([])

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    supabase.from('worker_profiles').select('*').eq('id', uid).single()
      .then(({ data }) => setWorkerProfile(data))

    supabase.from('instant_bookings')
      .select('*')
      .eq('worker_id', uid)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setRecentJobs(data ?? []))

    supabase.from('ratings')
      .select('*, rater:profiles!ratings_rater_id_fkey(name)')
      .eq('ratee_id', uid)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentRatings(data ?? []))
  }, [session])

  async function handleLogout() {
    Alert.alert('Logout', 'क्या आप logout करना चाहते हैं?', [
      { text: 'नहीं' },
      {
        text: 'हाँ', onPress: async () => {
          await signOut()
          reset()
        }
      },
    ])
  }

  const avgRating = workerProfile?.avg_rating ?? 0
  const totalJobs = workerProfile?.total_jobs ?? 0

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0) ?? 'W'}</Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.phone}>{profile?.phone}</Text>
          {workerProfile && (
            <View style={styles.skillBadge}>
              <Text style={styles.skillBadgeText}>
                {getSkillLabel(workerProfile.skill, 'hi')} · {workerProfile.experience_years}+ साल
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox iconName="star-outline" value={avgRating > 0 ? avgRating.toFixed(1) : '—'} label="रेटिंग" />
          <StatBox iconName="briefcase-outline" value={String(totalJobs)} label="कुल काम" />
          <StatBox iconName="wallet-outline" value={workerProfile?.daily_wage ? `₹${workerProfile.daily_wage}` : '—'} label="दिहाड़ी" />
        </View>

        {/* Recent ratings */}
        {recentRatings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>हाल की रेटिंग</Text>
            {recentRatings.map(r => (
              <View key={r.id} style={styles.ratingRow}>
                <Text style={styles.ratingStars}>{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</Text>
                <View style={styles.ratingInfo}>
                  <Text style={styles.ratingRater}>{r.rater?.name ?? 'ठेकेदार'}</Text>
                  {r.comment && <Text style={styles.ratingComment}>"{r.comment}"</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Job history */}
        {recentJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>काम की हिस्ट्री</Text>
            {recentJobs.map(job => (
              <View key={job.id} style={styles.jobRow}>
                <View style={styles.jobDot} />
                <View style={styles.jobInfo}>
                  <Text style={styles.jobSkill}>{job.skill_required}</Text>
                  <Text style={styles.jobAddress} numberOfLines={1}>{job.work_address}</Text>
                  <Text style={styles.jobWage}>₹{job.agreed_wage} · {new Date(job.work_date).toLocaleDateString('hi-IN')}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>सेटिंग्स</Text>
          <SettingsRow label="प्रोफ़ाइल एडिट करें" onPress={() => {}} />
          <SettingsRow label="भाषा बदलें" onPress={() => {}} />
          <SettingsRow label="Help & Support" onPress={() => {}} />
          <SettingsRow label="Logout" onPress={handleLogout} danger />
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

function StatBox({ iconName, value, label }: { iconName: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={iconName} size={24} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function SettingsRow({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingsRow}>
      <Text style={[styles.settingsLabel, danger && styles.settingsDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { padding: Spacing['2xl'], gap: Spacing.xl, paddingBottom: 120 },

  hero: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  avatar: {
    width: 88, height: 88, borderRadius: Radius.full,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.md,
  },
  avatarText: { fontSize: 40, fontWeight: Typography.black, color: Colors.white },
  name: { fontSize: Typography['2xl'], fontWeight: Typography.black, color: Colors.textPrimary },
  phone: { fontSize: Typography.base, color: Colors.textMuted },
  skillBadge: {
    backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs, borderRadius: Radius.full,
  },
  skillBadgeText: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.black },

  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.sm, ...Shadow.sm,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.black, color: Colors.black },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted },

  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },

  ratingRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.base, ...Shadow.sm,
  },
  ratingStars: { fontSize: 16, color: Colors.primary, letterSpacing: 2 },
  ratingInfo: { flex: 1, gap: 2 },
  ratingRater: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  ratingComment: { fontSize: Typography.sm, color: Colors.textSecondary, fontStyle: 'italic' },

  jobRow: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start',
    backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm,
  },
  jobDot: { width: 10, height: 10, borderRadius: Radius.full, backgroundColor: Colors.primary, marginTop: 4 },
  jobInfo: { flex: 1, gap: 2 },
  jobSkill: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  jobAddress: { fontSize: Typography.sm, color: Colors.textSecondary },
  jobWage: { fontSize: Typography.xs, color: Colors.textMuted },

  settingsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.sm,
  },
  settingsLabel: { fontSize: Typography.base, color: Colors.textPrimary },
  settingsDanger: { color: Colors.error },
  settingsArrow: { fontSize: Typography.xl, color: Colors.textMuted },
})
