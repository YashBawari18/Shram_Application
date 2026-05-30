import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { fetchBookingWithProfiles, markJobStarted, markJobCompleted } from '../../../src/lib/booking'
import { useBookingStore } from '../../../src/stores/bookingStore'
import { Button } from '../../../src/components/ui/Button'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme'

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'इंतज़ार में', color: Colors.warning,  bg: Colors.warningLight },
  accepted:  { label: 'स्वीकृत',    color: Colors.success,  bg: Colors.successLight },
  started:   { label: 'काम चालू',   color: Colors.info,     bg: Colors.infoLight },
  completed: { label: 'पूरा हुआ',   color: Colors.success,  bg: Colors.successLight },
  rejected:  { label: 'मना किया',   color: Colors.error,    bg: Colors.errorLight },
  cancelled: { label: 'रद्द',       color: Colors.error,    bg: Colors.errorLight },
}

export default function WorkerBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { updateStatus } = useBookingStore()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchBookingWithProfiles(id).then(data => {
      setBooking(data)
      setLoading(false)
    })
  }, [id])

  async function handleAction(action: 'started' | 'completed') {
    setActionLoading(true)
    if (action === 'started') await markJobStarted(id)
    else await markJobCompleted(id)
    const updated = await fetchBookingWithProfiles(id)
    setBooking(updated)
    setActionLoading(false)

    if (action === 'completed') {
      router.push(`/(worker)/rate/${id}` as any)
    }
  }

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator style={{ flex: 1 }} color={Colors.primary} /></SafeAreaView>
  if (!booking) return null

  const meta = STATUS_META[booking.status] ?? STATUS_META.pending
  const contractor = booking.contractor

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← वापस</Text>
        </TouchableOpacity>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Contractor info */}
        <View style={styles.contractorCard}>
          <View style={styles.contractorAvatar}>
            <Text style={styles.contractorInitial}>{contractor?.name?.charAt(0) ?? 'C'}</Text>
          </View>
          <View style={styles.contractorInfo}>
            <Text style={styles.contractorName}>{contractor?.name}</Text>
            <Text style={styles.contractorLabel}>ठेकेदार</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/(worker)/chat/${booking.id}` as any)}
            style={styles.chatBtn}
          >
            <Text style={styles.chatBtnText}>💬 Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Job details */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>काम की जानकारी</Text>
          <DetailRow icon="📍" label="जगह" value={booking.work_address} />
          <DetailRow icon="🔧" label="हुनर" value={booking.skill_required} />
          <DetailRow icon="💰" label="दिहाड़ी" value={`₹${booking.agreed_wage.toLocaleString('en-IN')} / दिन`} />
          <DetailRow icon="📅" label="तारीख" value={new Date(booking.work_date).toLocaleDateString('hi-IN')} />
          {booking.notes && <DetailRow icon="📝" label="नोट" value={booking.notes} />}
        </View>

        {/* Action buttons based on status */}
        {booking.status === 'accepted' && (
          <Button label="▶ काम शुरू करें" onPress={() => handleAction('started')} loading={actionLoading} />
        )}
        {booking.status === 'started' && (
          <Button label="✓ काम पूरा हुआ" onPress={() => {
            Alert.alert('काम पूरा?', 'क्या आप वाकई काम पूरा करना चाहते हैं?', [
              { text: 'नहीं' },
              { text: 'हाँ, पूरा हुआ', onPress: () => handleAction('completed') },
            ])
          }} loading={actionLoading} />
        )}
        {booking.status === 'completed' && (
          <TouchableOpacity onPress={() => router.push(`/(worker)/rate/${booking.id}` as any)} style={styles.rateBtn}>
            <Text style={styles.rateBtnText}>⭐ ठेकेदार को रेटिंग दें</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailTexts}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl, paddingBottom: Spacing.base },
  backText: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.medium },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  statusText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  scroll: { padding: Spacing['2xl'], gap: Spacing.base },
  contractorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.offWhite, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.md },
  contractorAvatar: { width: 48, height: 48, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  contractorInitial: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.black },
  contractorInfo: { flex: 1 },
  contractorName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  contractorLabel: { fontSize: Typography.sm, color: Colors.textMuted },
  chatBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  chatBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.black },
  detailCard: { backgroundColor: Colors.offWhite, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.base },
  detailTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  detailRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  detailIcon: { fontSize: 20, width: 28 },
  detailTexts: { flex: 1 },
  detailLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  detailValue: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
  rateBtn: { backgroundColor: Colors.primaryLight, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', borderWidth: 2, borderColor: Colors.primary },
  rateBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.black },
})
