import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, Alert,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '../../../src/lib/supabase'
import { useAuthStore } from '../../../src/stores/authStore'
import { fetchBookingWithProfiles } from '../../../src/lib/booking'
import { Button } from '../../../src/components/ui/Button'
import { Colors, Typography, Spacing, Radius } from '../../../src/constants/theme'

const LABELS = ['', 'बहुत खराब', 'खराब', 'ठीक है', 'अच्छा', 'बहुत अच्छा']

export default function ContractorRateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { session } = useAuthStore()
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (score === 0) { Alert.alert('रेटिंग दें', 'कृपया एक स्टार चुनें।'); return }
    setLoading(true)

    const booking = await fetchBookingWithProfiles(id)
    if (!booking) { setLoading(false); return }

    const userId = session?.user?.id
    if (!userId) {
      Alert.alert('त्रुटि', 'लॉगिन आवश्यक है।')
      setLoading(false)
      return
    }
    const rateeId = booking.worker_id

    const { error } = await supabase.from('ratings').insert({
      booking_id: id,
      rater_id: userId,
      ratee_id: rateeId,
      score,
      comment: comment.trim() || null,
    })

    setLoading(false)
    if (error && !error.message.includes('duplicate')) {
      Alert.alert('Error', error.message)
      return
    }

    Alert.alert('✓ रेटिंग दे दी!', 'शुक्रिया।', [
      { text: 'ठीक है', onPress: () => router.replace('/(contractor)/home' as any) }
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>मज़दूर को रेटिंग दें ⭐</Text>
        <Text style={styles.sub}>काम कैसा था?</Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity key={i} onPress={() => setScore(i)} style={styles.starBtn}>
              <Text style={[styles.star, i <= score && styles.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {score > 0 && <Text style={styles.scoreLabel}>{LABELS[score]}</Text>}

        <TextInput
          style={styles.commentInput}
          placeholder="कुछ और कहना है? (ऐच्छिक)"
          placeholderTextColor={Colors.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
        />

        <Button label="रेटिंग जमा करें" onPress={handleSubmit} loading={loading} />
        <TouchableOpacity onPress={() => router.replace('/(contractor)/home' as any)} style={styles.skip}>
          <Text style={styles.skipText}>अभी नहीं</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, padding: Spacing['2xl'], alignItems: 'center', justifyContent: 'center', gap: Spacing.xl },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.black, color: Colors.black },
  sub: { fontSize: Typography.base, color: Colors.textSecondary },
  stars: { flexDirection: 'row', gap: Spacing.base },
  starBtn: { padding: Spacing.sm },
  star: { fontSize: 48, color: Colors.border },
  starActive: { color: Colors.primary },
  scoreLabel: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textSecondary },
  commentInput: { width: '100%', backgroundColor: Colors.surfaceSecondary, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.base, fontSize: Typography.base, color: Colors.textPrimary, minHeight: 80 },
  skip: { marginTop: Spacing.sm },
  skipText: { fontSize: Typography.base, color: Colors.textMuted },
})
