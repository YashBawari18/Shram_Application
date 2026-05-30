import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { fetchBookingWithProfiles } from '../../../src/lib/booking'
import { useBookingStore } from '../../../src/stores/bookingStore'
import { Button } from '../../../src/components/ui/Button'
import { Colors, Typography, Spacing, Radius } from '../../../src/constants/theme'
import { Ionicons } from '@expo/vector-icons'

export default function ContractorBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { updateStatus } = useBookingStore()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchBookingWithProfiles(id).then(data => {
      setBooking(data)
      setLoading(false)
    })
  }, [id])

  async function handleCancel() {
    Alert.alert('बुकिंग रद्द करें?', 'क्या आप वाकई यह बुकिंग रद्द करना चाहते हैं?', [
      { text: 'नहीं' },
      {
        text: 'हाँ, रद्द करें', style: 'destructive',
        onPress: async () => {
          setCancelling(true)
          await updateStatus(id, 'cancelled')
          setCancelling(false)
          router.back()
        }
      },
    ])
  }

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator style={{ flex: 1 }} color={Colors.primary} /></SafeAreaView>
  if (!booking) return null

  const worker = booking.worker
  const canCancel = ['pending', 'accepted'].includes(booking.status)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
          <Text style={styles.back}>वापस</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>बुकिंग विवरण</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Worker card */}
        <View style={styles.workerCard}>
          <View style={styles.workerAvatar}>
            <Text style={styles.workerInitial}>{worker?.name?.charAt(0) ?? 'W'}</Text>
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{worker?.name}</Text>
            <Text style={styles.workerSkill}>{booking.skill_required}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/(contractor)/chat/${booking.id}` as any)}
            style={styles.chatBtn}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.white} />
              <Text style={styles.chatBtnText}>Chat</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={styles.detailCard}>
          <Row iconName="cash-outline" label="दिहाड़ी" value={`₹${booking.agreed_wage.toLocaleString('en-IN')} / दिन`} />
          <Row iconName="location-outline" label="पता" value={booking.work_address} />
          <Row iconName="calendar-outline" label="तारीख" value={new Date(booking.work_date).toLocaleDateString('hi-IN')} />
          <Row iconName="hammer-outline" label="हुनर" value={booking.skill_required} />
          {booking.notes && <Row iconName="document-text-outline" label="नोट" value={booking.notes} />}
          <Row iconName="sync-outline" label="Status" value={booking.status.toUpperCase()} />
        </View>

        {canCancel && (
          <Button label="बुकिंग रद्द करें" onPress={handleCancel} variant="danger" loading={cancelling} />
        )}

        {booking.status === 'completed' && (
          <TouchableOpacity
            onPress={() => router.push(`/(contractor)/rate/${booking.id}` as any)}
            style={styles.rateBtn}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="star" size={20} color={Colors.primary} />
              <Text style={styles.rateBtnText}>मज़दूर को रेटिंग दें</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({ iconName, label, value }: { iconName: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={iconName} size={20} color={Colors.primary} style={{ width: 28 }} />
      <View style={styles.rowTexts}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl, paddingBottom: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  back: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: Typography.medium },
  headerTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  scroll: { padding: Spacing['2xl'], gap: Spacing.base },
  workerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.offWhite, borderRadius: Radius.xl, padding: Spacing.base, gap: Spacing.md },
  workerAvatar: { width: 48, height: 48, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  workerInitial: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  workerInfo: { flex: 1 },
  workerName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  workerSkill: { fontSize: Typography.sm, color: Colors.textMuted },
  chatBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  chatBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.white },
  detailCard: { backgroundColor: Colors.offWhite, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.base },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  rowIcon: { fontSize: 20, width: 28 },
  rowTexts: { flex: 1 },
  rowLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  rowValue: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
  rateBtn: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', borderWidth: 2, borderColor: Colors.primary },
  rateBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primary },
})
