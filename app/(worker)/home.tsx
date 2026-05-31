import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, Alert, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../src/stores/authStore'
import { useWorkerStore } from '../../src/stores/workerStore'
import { useBookingStore } from '../../src/stores/bookingStore'
import { useBookingRealtime } from '../../src/hooks/useBookingRealtime'
import { Button } from '../../src/components/ui/Button'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/design/theme'
import { InstantBooking } from '../../src/types/app'

export default function WorkerHome() {
  const { session, profile } = useAuthStore()
  const { availability, isLoading, fetchAvailability, goOnline, goOffline, updateWage } = useWorkerStore()
  const { pendingRequests, activeBookings } = useBookingStore()

  const userId = session?.user?.id ?? ''
  useBookingRealtime(userId, 'worker')

  const [wageDraft, setWageDraft] = useState<number | null>(null)

  useEffect(() => {
    if (userId) fetchAvailability(userId)
  }, [userId])

  const isOnline = availability?.is_online ?? false
  const currentWage = wageDraft ?? availability?.today_wage ?? 600

  async function handleToggle(val: boolean) {
    if (!userId) return
    if (val) {
      const result = await goOnline(userId, currentWage)
      if (!result.success) Alert.alert('Error', result.error)
    } else {
      await goOffline(userId)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>नमस्ते, {profile?.name?.split(' ')[0]}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(worker)/profile' as any)}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarInitial}>{profile?.name?.charAt(0) ?? 'W'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.toggleCard, isOnline && styles.toggleCardOnline]}>
          <View style={styles.toggleTop}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isOnline ? Colors.online : Colors.offline }} />
                <Text style={[styles.statusText, isOnline && styles.statusTextOnline]}>
                  {isOnline ? 'आप ऑनलाइन हैं' : 'आप ऑफलाइन हैं'}
                </Text>
              </View>
              <Text style={styles.statusSub}>
                {isOnline
                  ? `ठेकेदार आपको देख सकते हैं · ${availability?.location_name ?? ''}`
                  : 'काम पाने के लिए ऑनलाइन हों'}
              </Text>
            </View>
            {isLoading
              ? <ActivityIndicator color={Colors.primary} />
              : <Switch value={isOnline} onValueChange={handleToggle}
                  trackColor={{ false: Colors.border, true: Colors.online }}
                  thumbColor={Colors.white} ios_backgroundColor={Colors.border} />
            }
          </View>

          {isOnline && (
            <View style={styles.wageRow}>
              <Text style={styles.wageLabel}>आज की दिहाड़ी</Text>
              <View style={styles.wageDisplay}>
                <Text style={styles.wageAmount}>₹{currentWage.toLocaleString('en-IN')}</Text>
                <TouchableOpacity
                  onPress={() => Alert.prompt('दिहाड़ी बदलें', 'नई दिहाड़ी डालें (₹)',
                    async (val) => {
                      const n = parseInt(val ?? '')
                      if (!isNaN(n) && n >= 300) { setWageDraft(n); await updateWage(userId, n) }
                    }, 'plain-text', String(currentWage), 'numeric')}
                  style={styles.editBtn}>
                  <Text style={styles.editBtnText}>बदलें</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>नए बुकिंग रिक्वेस्ट ({pendingRequests.length})</Text>
            {pendingRequests.map(b => <BookingRequestCard key={b.id} booking={b} />)}
          </View>
        )}

        {activeBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>चल रहा काम</Text>
            {activeBookings.map(b => <ActiveJobCard key={b.id} booking={b} />)}
          </View>
        )}

        {isOnline && pendingRequests.length === 0 && activeBookings.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>ठेकेदार का इंतज़ार करें</Text>
            <Text style={styles.emptySub}>आप ऑनलाइन हैं — जैसे ही कोई बुकिंग आएगी, यहाँ दिखेगी</Text>
          </View>
        )}

        {!isOnline && (
          <View style={styles.offlineCard}>
            <Ionicons name="briefcase-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.offlineTitle}>काम पाने के लिए ऑनलाइन हों</Text>
            <Text style={styles.offlineSub}>नाका पर खड़े होने की ज़रूरत नहीं — बस ऊपर का बटन चालू करें</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <StatCard key="rating" iconName="star-outline" label="रेटिंग" value="—" />
          <StatCard key="jobs" iconName="briefcase-outline" label="कुल काम" value="0" />
          <StatCard key="earnings" iconName="wallet-outline" label="कमाई" value="₹0" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function BookingRequestCard({ booking }: { booking: InstantBooking }) {
  const { updateStatus } = useBookingStore()
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
  const timeLeft = Math.max(0, Math.floor((new Date(booking.expires_at).getTime() - Date.now()) / 1000))
  async function handle(status: 'accepted' | 'rejected') {
    setLoading(status === 'accepted' ? 'accept' : 'reject')
    await updateStatus(booking.id, status)
    setLoading(null)
  }
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestSkill}>{booking.skill_required}</Text>
        <View style={styles.timerBadge}><Ionicons name="timer-outline" size={12} color={Colors.warning} /><Text style={styles.timerText}> {timeLeft}s</Text></View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Ionicons name="location-outline" size={14} color={Colors.textSecondary} /><Text style={styles.requestAddress}>{booking.work_address}</Text></View>
      <Text style={styles.requestWage}>₹{(booking.agreed_wage ?? 0).toLocaleString('en-IN')} / दिन</Text>
      {booking.notes ? <Text style={styles.requestNotes}>"{booking.notes}"</Text> : null}
      <View style={styles.requestBtns}>
        <Button label="मना करें" onPress={() => handle('rejected')} variant="secondary" size="md" fullWidth={false} style={styles.rejectBtn} loading={loading === 'reject'} />
        <Button label="स्वीकार करें" onPress={() => handle('accepted')} size="md" fullWidth={false} style={styles.acceptBtn} loading={loading === 'accept'} />
      </View>
    </View>
  )
}

function ActiveJobCard({ booking }: { booking: InstantBooking }) {
  return (
    <TouchableOpacity style={styles.activeCard} onPress={() => router.push(`/(worker)/booking/${booking.id}` as any)}>
      <View style={styles.activeBadge}>
        <Text style={styles.activeBadgeText}>{booking.status === 'accepted' ? 'CONFIRMED' : 'IN PROGRESS'}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Ionicons name="location-outline" size={14} color={Colors.border} /><Text style={styles.activeAddress}>{booking.work_address}</Text></View>
      <Text style={styles.activeWage}>₹{(booking.agreed_wage ?? 0).toLocaleString('en-IN')} / दिन</Text>
      <Text style={styles.activeTap}>Details देखें →</Text>
    </TouchableOpacity>
  )
}

function StatCard({ iconName, label, value }: { iconName: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={iconName} size={24} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl, paddingBottom: Spacing.base, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  greeting: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  date: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },
  avatarMini: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.white },
  scroll: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 100 },
  toggleCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, ...Shadow.sm, borderWidth: 2, borderColor: Colors.border },
  toggleCardOnline: { borderColor: Colors.online, backgroundColor: '#F0FFF4' },
  toggleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  statusTextOnline: { color: Colors.online },
  statusSub: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2, maxWidth: '80%' },
  wageRow: { marginTop: Spacing.base, paddingTop: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wageLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  wageDisplay: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  wageAmount: { fontSize: Typography.xl, fontWeight: Typography.black, color: Colors.textPrimary },
  editBtn: { backgroundColor: Colors.surfaceSecondary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.md },
  editBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.primary },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  requestCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 2, borderColor: Colors.primary, ...Shadow.md, gap: Spacing.sm },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestSkill: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  timerBadge: { backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.md },
  timerText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.warning },
  requestAddress: { fontSize: Typography.sm, color: Colors.textSecondary },
  requestWage: { fontSize: Typography.xl, fontWeight: Typography.black, color: Colors.textPrimary },
  requestNotes: { fontSize: Typography.sm, color: Colors.textMuted, fontStyle: 'italic' },
  requestBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  rejectBtn: { flex: 1 },
  acceptBtn: { flex: 2 },
  activeCard: { backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.xs, ...Shadow.md },
  activeBadge: { backgroundColor: Colors.accent, alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  activeBadgeText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.white },
  activeAddress: { fontSize: Typography.base, color: Colors.white, marginTop: Spacing.xs },
  activeWage: { fontSize: Typography.xl, fontWeight: Typography.black, color: Colors.accent },
  activeTap: { fontSize: Typography.sm, color: Colors.border, marginTop: Spacing.xs },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center' },
  offlineCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing['2xl'], alignItems: 'center', gap: Spacing.sm, ...Shadow.sm },
  offlineEmoji: { fontSize: 48 },
  offlineTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  offlineSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base, alignItems: 'center', gap: 4, ...Shadow.sm },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: Typography.lg, fontWeight: Typography.black, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted },
})
