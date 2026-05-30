import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { completeWorkerOnboarding } from '../../src/lib/onboarding'
import { useAuthStore } from '../../src/stores/authStore'
import { Skill } from '../../src/types/app'
import { Button } from '../../src/components/ui/Button'
import { TextInput } from '../../src/components/ui/TextInput'
import { SkillPicker } from '../../src/components/ui/SkillPicker'
import { WageSlider } from '../../src/components/ui/WageSlider'
import { StepIndicator } from '../../src/components/ui/StepIndicator'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme'
import { Ionicons } from '@expo/vector-icons'

const STEPS = ['परिचय', 'हुनर', 'दिहाड़ी']

const LANG_OPTIONS = [
  { key: 'hi' as const, label: 'हिंदी' },
  { key: 'mr' as const, label: 'मराठी' },
  { key: 'en' as const, label: 'English' },
]

const EXP_OPTIONS = [
  { value: 0, label: 'नया हूं', sub: 'Fresher' },
  { value: 1, label: '1–2 साल', sub: '1–2 years' },
  { value: 3, label: '3–5 साल', sub: '3–5 years' },
  { value: 6, label: '5+ साल', sub: '5+ years' },
]

export default function WorkerOnboardScreen() {
  const { session, loadProfile } = useAuthStore()

  // Form state
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState<'hi' | 'mr' | 'en'>('hi')
  const [skill, setSkill] = useState<Skill | null>(null)
  const [experienceYears, setExperienceYears] = useState(1)
  const [wage, setWage] = useState(600)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validateStep(): boolean {
    const e: Record<string, string> = {}
    if (step === 0 && name.trim().length < 2) {
      e.name = 'अपना पूरा नाम लिखें'
    }
    if (step === 1 && !skill) {
      e.skill = 'एक हुनर ज़रूर चुनें'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  function handleBack() {
    setStep(s => s - 1)
    setErrors({})
  }

  async function handleSubmit() {
    if (!session?.user) return
    setLoading(true)

    const result = await completeWorkerOnboarding(session.user.id, {
      name,
      skill: skill!,
      skills_extra: [],
      experience_years: experienceYears,
      daily_wage: wage,
      preferred_language: language,
    })

    if (!result.success) {
      Alert.alert('Error', result.error)
      setLoading(false)
      return
    }

    // Reload profile → RouteGuard routes to worker home
    await loadProfile()
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.topBar}>
          <View style={styles.logoMini}>
            <Text style={styles.logoText}>श्रम</Text>
          </View>
          <Text style={styles.topTitle}>मज़दूर प्रोफ़ाइल बनाएं</Text>
        </View>

        <StepIndicator current={step} total={3} labels={STEPS} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && (
            <StepZero
              name={name}
              setName={setName}
              language={language}
              setLanguage={setLanguage}
              errors={errors}
            />
          )}
          {step === 1 && (
            <StepOne
              skill={skill}
              setSkill={setSkill}
              errors={errors}
            />
          )}
          {step === 2 && (
            <StepTwo
              wage={wage}
              setWage={setWage}
              experienceYears={experienceYears}
              setExperienceYears={setExperienceYears}
            />
          )}
        </ScrollView>

        {/* Footer buttons */}
        <View style={styles.footer}>
          {step > 0 && (
            <Button
              label="पीछे"
              onPress={handleBack}
              variant="secondary"
              fullWidth={false}
              style={styles.backBtn}
            />
          )}
          <View style={styles.footerMain}>
            {step < 2 ? (
              <Button label="आगे बढ़ें" onPress={handleNext} />
            ) : (
              <Button
                label="प्रोफ़ाइल बनाएं"
                onPress={handleSubmit}
                loading={loading}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Step 0: Name + Language ──────────────────────────────────────────────────
function StepZero({ name, setName, language, setLanguage, errors }: any) {
  return (
    <View>
      <Text style={styles.stepTitle}>आपका नाम क्या है?</Text>
      <Text style={styles.stepSub}>यह नाम कॉन्ट्रैक्टर को दिखेगा</Text>

      <TextInput
        label="पूरा नाम"
        placeholder="जैसे: रामू यादव"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
        returnKeyType="done"
      />

      <Text style={styles.sectionLabel}>भाषा चुनें</Text>
      <View style={styles.langRow}>
        {LANG_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setLanguage(opt.key)}
            style={[styles.langChip, language === opt.key && styles.langChipActive]}
          >
            <Text style={[styles.langText, language === opt.key && styles.langTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

// ─── Step 1: Skill ────────────────────────────────────────────────────────────
function StepOne({ skill, setSkill, errors }: any) {
  return (
    <View>
      <Text style={styles.stepTitle}>आपका हुनर क्या है?</Text>
      <Text style={styles.stepSub}>जो काम आप सबसे अच्छा करते हैं</Text>
      <SkillPicker
        selected={skill}
        onSelect={setSkill}
        error={errors.skill}
      />
    </View>
  )
}

// ─── Step 2: Wage + Experience ────────────────────────────────────────────────
function StepTwo({ wage, setWage, experienceYears, setExperienceYears }: any) {
  return (
    <View>
      <Text style={styles.stepTitle}>आज की दिहाड़ी कितनी?</Text>
      <Text style={styles.stepSub}>स्लाइडर खींचकर दिहाड़ी सेट करें</Text>

      <WageSlider value={wage} onChange={setWage} label="आज की दिहाड़ी" />

      <Text style={styles.sectionLabel}>अनुभव कितना है?</Text>
      <View style={styles.expGrid}>
        {EXP_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setExperienceYears(opt.value)}
            style={[styles.expCard, experienceYears === opt.value && styles.expCardActive]}
          >
            <Text style={[styles.expLabel, experienceYears === opt.value && styles.expLabelActive]}>
              {opt.label}
            </Text>
            <Text style={[styles.expSub, experienceYears === opt.value && styles.expSubActive]}>
              {opt.sub}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preview card */}
      <View style={styles.previewCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.xs }}>
          <Ionicons name="checkmark-circle-outline" size={16} color={Colors.white} />
          <Text style={styles.previewTitle}>यह दिखेगा कॉन्ट्रैक्टर को</Text>
        </View>
        <Text style={styles.previewWage}>₹{wage.toLocaleString('en-IN')} / दिन</Text>
        <Text style={styles.previewExp}>
          अनुभव: {EXP_OPTIONS.find(e => e.value === experienceYears)?.label}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    gap: Spacing.md,
  },
  logoMini: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: Typography.black, color: Colors.white },
  topTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },

  scroll: { paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing['2xl'] },

  stepTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepSub: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },

  sectionLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  langRow: { flexDirection: 'row', gap: Spacing.sm },
  langChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
  },
  langChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  langText: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.textSecondary },
  langTextActive: { color: Colors.primary, fontWeight: Typography.bold },

  expGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  expCard: {
    width: '47%',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
  },
  expCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  expLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  expLabelActive: { color: Colors.primary },
  expSub: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  expSubActive: { color: Colors.primary },

  previewCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  previewTitle: { fontSize: Typography.sm, color: Colors.white, fontWeight: Typography.semibold },
  previewWage: { fontSize: Typography['2xl'], fontWeight: Typography.black, color: Colors.white },
  previewExp: { fontSize: Typography.sm, color: Colors.border },

  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.base,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  backBtn: { width: 90 },
  footerMain: { flex: 1 },
})
