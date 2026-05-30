import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../src/lib/supabase'
import { useAuthStore } from '../../src/stores/authStore'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme'
import { BookingStatus } from '../../src/types/app'

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  pending:   { bg: Colors.warningLight,  text: Colors.warning },
  accepted:  { bg: Colors.successLight,  text: Colors.success },
  started:   { bg: Colors.infoLight,     text: Colors.info },
  completed: { bg: Colors.successLight,  text: Colors.success },
  rejected:  { bg: Colors.errorLight,    text: Colors.error },
  cancelled: { bg: Colors.errorLight,    text: Colors.error },
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'इंतज़ार में',
  accepted:  'स्वीकृत',
  started:   'चालू',
  completed: 'पूरा हुआ',
  rejected:  'मना किया',
  cancelled: 'रद्द',
}

export default function WorkerJobs() {
  const { session } = useAuthStore()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all')

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    let query = supabase
      .from('instant_bookings')
      .select('*')
      .eq('worker_id', uid)
      .order('created_at', { ascending: false })

    if (filter === 'completed') query = query.eq('status', 'completed')
    else if (filter === 'active') query = query.in('status', ['pending', 'accepted', 'started'])

    query.then(({ data }) => {
      setJobs(data ?? [])
      setLoading(false)
    })
  }, [session, filter])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>मेरे काम</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' ? 'सभी' : f === 'active' ? 'चालू' : 'पूरे हुए'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={j => j.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status as BookingStatus]
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/(worker)/booking/${item.id}` as any)}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardSkill}>{item.skill_required}</Text>
                  <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.badgeText, { color: sc.text }]}>
                      {STATUS_LABELS[item.status as BookingStatus]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardAddress} numberOfLines={1}>📍 {item.work_address}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardWage}>₹{item.agreed_wage.toLocaleString('en-IN')}/दिन</Text>
                  <Text style={styles.cardDate}>{new Date(item.work_date).toLocaleDateString('hi-IN')}</Text>
                </View>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>कोई काम नहीं मिला</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  header: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl, paddingBottom: Spacing.base, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  filterRow: { flexDirection: 'row', backgroundColor: Colors.white, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  filterTab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, alignItems: 'center', backgroundColor: Colors.surfaceSecondary },
  filterTabActive: { backgroundColor: Colors.primary },
  filterTabText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.black, fontWeight: Typography.bold },
  list: { padding: Spacing.base, gap: Spacing.sm },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.sm, ...Shadow.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardSkill: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  badgeText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  cardAddress: { fontSize: Typography.sm, color: Colors.textSecondary },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardWage: { fontSize: Typography.base, fontWeight: Typography.black, color: Colors.black },
  cardDate: { fontSize: Typography.xs, color: Colors.textMuted },
  empty: { alignItems: 'center', paddingTop: Spacing['4xl'], gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.base, color: Colors.textMuted },
})
