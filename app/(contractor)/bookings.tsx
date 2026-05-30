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

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   '⏳ Pending',
  accepted:  '✓ Accepted',
  started:   '⚙️ In Progress',
  completed: '✅ Completed',
  rejected:  '✗ Rejected',
  cancelled: '✗ Cancelled',
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   Colors.warning,
  accepted:  Colors.success,
  started:   Colors.info,
  completed: Colors.success,
  rejected:  Colors.error,
  cancelled: Colors.error,
}

export default function ContractorBookings() {
  const { session } = useAuthStore()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active')

  useEffect(() => {
    const uid = session?.user?.id
    if (!uid) return

    let query = supabase
      .from('instant_bookings')
      .select(`*, worker:profiles!instant_bookings_worker_id_fkey(name)`)
      .eq('contractor_id', uid)
      .order('created_at', { ascending: false })

    if (filter === 'active') query = query.in('status', ['pending', 'accepted', 'started'])
    else if (filter === 'completed') query = query.in('status', ['completed', 'rejected', 'cancelled'])

    query.then(({ data }) => {
      setBookings(data ?? [])
      setLoading(false)
    })
  }, [session, filter])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>मेरी बुकिंग्स</Text>
      </View>

      <View style={styles.filterRow}>
        {(['active', 'completed', 'all'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.tab, filter === f && styles.tabActive]}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
              {f === 'active' ? 'चालू' : f === 'completed' ? 'पूरी हुईं' : 'सभी'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={b => b.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(contractor)/booking/${item.id}` as any)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.workerName}>{item.worker?.name ?? 'Worker'}</Text>
                <Text style={[styles.status, { color: STATUS_COLORS[item.status as BookingStatus] }]}>
                  {STATUS_LABELS[item.status as BookingStatus]}
                </Text>
              </View>
              <Text style={styles.skill}>{item.skill_required}</Text>
              <Text style={styles.address} numberOfLines={1}>📍 {item.work_address}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.wage}>₹{item.agreed_wage.toLocaleString('en-IN')}/दिन</Text>
                <TouchableOpacity
                  onPress={() => router.push(`/(contractor)/chat/${item.id}` as any)}
                  style={styles.chatBtn}
                >
                  <Text style={styles.chatBtnText}>💬 Chat</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>कोई बुकिंग नहीं</Text>
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
  tab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, alignItems: 'center', backgroundColor: Colors.surfaceSecondary },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
  tabTextActive: { color: Colors.black, fontWeight: Typography.bold },
  list: { padding: Spacing.base, gap: Spacing.sm },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.sm, ...Shadow.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workerName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  status: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  skill: { fontSize: Typography.sm, color: Colors.textSecondary },
  address: { fontSize: Typography.sm, color: Colors.textMuted },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs },
  wage: { fontSize: Typography.lg, fontWeight: Typography.black, color: Colors.black },
  chatBtn: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, borderRadius: Radius.md },
  chatBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.black },
  empty: { alignItems: 'center', paddingTop: Spacing['4xl'], gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.base, color: Colors.textMuted },
})
