import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { NearbyWorker } from '../../types/app'
import { getSkillLabel } from '../../constants/skills'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme'

interface WorkerCardProps {
  worker: NearbyWorker
  onPress: () => void
  onHire: () => void
}

export function WorkerCard({ worker, onPress, onHire }: WorkerCardProps) {
  const stars = Math.round(worker.avg_rating)

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
    >
      {/* Avatar */}
      <View style={styles.avatarBox}>
        {worker.avatar_url ? (
          <Image source={{ uri: worker.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {worker.name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <View style={styles.onlineDot} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{worker.name ?? 'Worker'}</Text>
        <View style={styles.row}>
          <Text style={styles.skill}>
            {getSkillLabel(worker.skill as any, 'hi')}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.distance}>{worker.distance_km} km</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.stars}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</Text>
          <Text style={styles.ratingText}>
            {worker.avg_rating > 0 ? worker.avg_rating.toFixed(1) : 'New'}
            {worker.total_jobs > 0 ? ` (${worker.total_jobs} jobs)` : ''}
          </Text>
        </View>
      </View>

      {/* Wage + Hire CTA */}
      <View style={styles.right}>
        <Text style={styles.wage}>₹{worker.today_wage.toLocaleString('en-IN')}</Text>
        <Text style={styles.perDay}>/दिन</Text>
        <TouchableOpacity onPress={onHire} style={styles.hireBtn} activeOpacity={0.8}>
          <Text style={styles.hireBtnText}>Hire</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  avatarBox: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: Radius.full },
  avatarPlaceholder: {
    width: 52, height: 52, borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.black },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: Radius.full,
    backgroundColor: Colors.online,
    borderWidth: 2, borderColor: Colors.white,
  },
  info: { flex: 1, gap: 3 },
  name: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  skill: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  dot: { color: Colors.textMuted },
  distance: { fontSize: Typography.sm, color: Colors.textMuted },
  stars: { fontSize: 11, color: Colors.primary, letterSpacing: 1 },
  ratingText: { fontSize: Typography.xs, color: Colors.textMuted },
  right: { alignItems: 'flex-end', gap: 2 },
  wage: { fontSize: Typography.lg, fontWeight: Typography.black, color: Colors.black },
  perDay: { fontSize: Typography.xs, color: Colors.textMuted },
  hireBtn: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  hireBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.black },
})
