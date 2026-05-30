import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../src/stores/authStore'
import { useNearbyWorkers } from '../../src/hooks/useNearbyWorkers'
import { useBookingRealtime } from '../../src/hooks/useBookingRealtime'
import { WorkerCard } from '../../src/components/worker/WorkerCard'
import { SKILLS, SKILL_ICONS } from '../../src/constants/skills'
import { Skill, NearbyWorker } from '../../src/types/app'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme'

export default function ContractorHome() {
  const { session, profile } = useAuthStore()
  const userId = session?.user?.id ?? ''
  useBookingRealtime(userId, 'contractor')

  const [skillFilter, setSkillFilter] = useState<Skill | null>(null)
  const [maxWage, setMaxWage] = useState<number | null>(null)
  const [wageInput, setWageInput] = useState('')

  const { workers, isLoading, error, refresh } = useNearbyWorkers({
    skill: skillFilter,
    maxWage,
    radiusKm: 5,
  })

  function handleWageFilter(val: string) {
    setWageInput(val)
    const n = parseInt(val)
    setMaxWage(isNaN(n) ? null : n)
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>नमस्ते, {profile?.name?.split(' ')[0]}</Text>
          <Text style={styles.sub}>आस-पास के मज़दूर</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(contractor)/profile' as any)}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarInitial}>{profile?.name?.charAt(0) ?? 'C'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Skill filter chips */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          onPress={() => setSkillFilter(null)}
          style={[styles.filterChip, !skillFilter && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, !skillFilter && styles.filterTextActive]}>सभी</Text>
        </TouchableOpacity>
        {SKILLS.map(s => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setSkillFilter(skillFilter === s.key ? null : s.key)}
            style={[styles.filterChip, skillFilter === s.key && styles.filterChipActive]}
          >
            <Ionicons name={SKILL_ICONS[s.key] as any} size={14} color={skillFilter === s.key ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.filterText, skillFilter === s.key && styles.filterTextActive]}>
              {s.label_hi}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Max wage filter */}
      <View style={styles.wageFilter}>
        <Text style={styles.wageFilterLabel}>अधिकतम दिहाड़ी: ₹</Text>
        <TextInput
          style={styles.wageInput}
          value={wageInput}
          onChangeText={handleWageFilter}
          keyboardType="numeric"
          placeholder="कोई सीमा नहीं"
          placeholderTextColor={Colors.textMuted}
        />
        <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Workers list */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>आस-पास के मज़दूर ढूंढे जा रहे हैं...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>फिर से कोशिश करें</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workers}
          keyExtractor={w => w.worker_id}
          renderItem={({ item }) => (
            <WorkerCard
              worker={item}
              onPress={() => router.push(`/(contractor)/worker/${item.worker_id}` as any)}
              onHire={() => router.push({ pathname: '/(contractor)/worker/[id]', params: { id: item.worker_id, hire: '1' } } as any)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>कोई मज़दूर नहीं मिला</Text>
              <Text style={styles.emptySub}>5 km के अंदर कोई ऑनलाइन मज़दूर नहीं है। थोड़ी देर बाद फिर देखें।</Text>
            </View>
          }
          ListHeaderComponent={
            workers.length > 0 ? (
              <Text style={styles.listHeader}>{workers.length} मज़दूर मिले · 5 km के अंदर</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl, paddingBottom: Spacing.base, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  greeting: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  sub: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },
  avatarMini: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.white },
  filterBar: { flexDirection: 'row', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm, backgroundColor: Colors.white, flexWrap: 'nowrap' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surfaceSecondary },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  filterEmoji: { fontSize: 14 },
  filterText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  filterTextActive: { color: Colors.primary, fontWeight: Typography.bold },
  wageFilter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.sm, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: Spacing.sm },
  wageFilterLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  wageInput: { flex: 1, height: 36, backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  refreshBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  refreshText: { fontSize: 20 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.base },
  loadingText: { fontSize: Typography.base, color: Colors.textSecondary },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.base, padding: Spacing['2xl'] },
  errorText: { fontSize: Typography.base, color: Colors.error, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.md },
  retryText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.white },
  list: { padding: Spacing.base, paddingBottom: 100 },
  listHeader: { fontSize: Typography.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  emptyState: { alignItems: 'center', paddingTop: Spacing['4xl'], gap: Spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center' },
})
