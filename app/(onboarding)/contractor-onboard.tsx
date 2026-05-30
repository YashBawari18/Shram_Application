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
import { completeContractorOnboarding } from '../../src/lib/onboarding'
import { useAuthStore } from '../../src/stores/authStore'
import { Button } from '../../src/components/ui/Button'
import { TextInput } from '../../src/components/ui/TextInput'
import { StepIndicator } from '../../src/components/ui/StepIndicator'
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme'
import { Ionicons } from '@expo/vector-icons'

const STEPS = ['परिचय', 'कंपनी']

const LANG_OPTIONS = [
  { key: 'hi' as const, label: 'हिंदी' },
  { key: 'mr' as const, label: 'मराठी' },
  { key: 'en' as const, label: 'English' },
]

// What type of hirer are you?
const HIRER_TYPES: { key: string; label: string; sub: string; iconName: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'contractor', label: 'ठेकेदार', sub: 'Contractor', iconName: 'hammer-outline' },
  { key: 'builder',    label: 'बिल्डर',   sub: 'Builder',    iconName: 'business-outline' },
  { key: 'supervisor', label: 'सुपरवाइज़र', sub: 'Supervisor', iconName: 'document-text-outline' },
  { key: 'homeowner',  label: 'घर मालिक', sub: 'Homeowner',  iconName: 'home-outline' },
]

export default function ContractorOnboardScreen() {
  const { session, loadProfile } = useAuthStore()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState<'hi' | 'mr' | 'en'>('hi')
  const [hirerType, setHirerType] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validateStep(): boolean {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (name.trim().length < 2) e.name = 'अपना पूरा नाम लिखें'
      if (!hirerType) e.hirerType = 'एक विकल्प चुनें'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (!validateStep()) return
    setStep(1)
  }

  async function handleSubmit() {
    if (!session?.user) return
    setLoading(true)

    const result = await completeContractorOnboarding(session.user.id, {
      name,
      company_name: companyName,
      gst_number: gstNumber,
      preferred_language: language,
    })

    if (!result.success) {
      Alert.alert('Error', result.error)
      setLoading(false)
      return
    }

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
          <Text style={styles.topTitle}>ठेकेदार प्रोफ़ाइल बनाएं</Text>
        </View>

        <StepIndicator current={step} total={2} labels={STEPS} />

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
              hirerType={hirerType}
              setHirerType={setHirerType}
              errors={errors}
            />
          )}
          {step === 1 && (
            <StepOne
              companyName={companyName}
              setCompanyName={setCompanyName}
              gstNumber={gstNumber}
              setGstNumber={setGstNumber}
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 && (
            <Button
              label="पीछे"
              onPress={() => { setStep(0); setErrors({}) }}
              variant="secondary"
              fullWidth={false}
              style={styles.backBtn}
            />
          )}
          <View style={styles.footerMain}>
            {step === 0 ? (
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

// ─── Step 0: Name + Type + Language ──────────────────────────────────────────
function StepZero({ name, setName, language, setLanguage, hirerType, setHirerType, errors }: any) {
  return (
    <View>
      <Text style={styles.stepTitle}>आप कौन हैं?</Text>
      <Text style={styles.stepSub}>मज़दूरों को आपकी पहचान दिखेगी</Text>

      <TextInput
        label="आपका नाम"
        placeholder="जैसे: संजय शर्मा"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
        returnKeyType="done"
      />

      <Text style={styles.sectionLabel}>आप क्या हैं?</Text>
      {errors.hirerType && <Text style={styles.fieldError}>{errors.hirerType}</Text>}
      <View style={styles.typeGrid}>
        {HIRER_TYPES.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setHirerType(t.key)}
            style={[styles.typeCard, hirerType === t.key && styles.typeCardActive]}
          >
            <Ionicons name={t.iconName} size={30} color={hirerType === t.key ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.typeLabel, hirerType === t.key && styles.typeLabelActive]}>
              {t.label}
            </Text>
            <Text style={styles.typeSub}>{t.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

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

// ─── Step 1: Company details ──────────────────────────────────────────────────
function StepOne({ companyName, setCompanyName, gstNumber, setGstNumber }: any) {
  return (
    <View>
      <Text style={styles.stepTitle}>कंपनी की जानकारी</Text>
      <Text style={styles.stepSub}>यह ज़रूरी नहीं है — चाहें तो छोड़ सकते हैं</Text>

      <TextInput
        label="कंपनी / फर्म का नाम (ऐच्छिक)"
        placeholder="जैसे: Sharma Construction Co."
        value={companyName}
        onChangeText={setCompanyName}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <TextInput
        label="GST नंबर (ऐच्छिक)"
        placeholder="22AAAAA0000A1Z5"
        value={gstNumber}
        onChangeText={t => setGstNumber(t.toUpperCase())}
        autoCapitalize="characters"
        maxLength={15}
        returnKeyType="done"
        hint="GST नंबर देने से मज़दूरों का विश्वास बढ़ता है"
      />

      {/* Trust building callout */}
      <View style={styles.trustCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm }}>
          <Ionicons name="checkmark-circle-outline" size={16} color={Colors.white} />
          <Text style={styles.trustTitle}>आपका प्रोफ़ाइल कैसा दिखेगा</Text>
        </View>
        <View style={styles.trustRow}>
          <Ionicons name="business-outline" size={36} color={Colors.white} />
          <View>
            <Text style={styles.trustName}>{companyName || 'आपकी कंपनी'}</Text>
            <Text style={styles.trustMeta}>
              {gstNumber ? `GST: ${gstNumber}` : 'GST नंबर नहीं'}
              {' · '}नया ठेकेदार
            </Text>
          </View>
        </View>
        <Text style={styles.trustNote}>
          💡 काम पूरा होने पर मज़दूर आपको रेटिंग देंगे — इससे विश्वास बनता है
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
    width: 40, height: 40,
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
  fieldError: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  typeCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    gap: 4,
  },
  typeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  typeEmoji: { fontSize: 30 },
  typeLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  typeLabelActive: { color: Colors.primary },
  typeSub: { fontSize: Typography.xs, color: Colors.textMuted },

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

  trustCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  trustTitle: { fontSize: Typography.sm, color: Colors.white, fontWeight: Typography.semibold },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  trustIcon: { fontSize: 36 },
  trustName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.white },
  trustMeta: { fontSize: Typography.xs, color: Colors.border },
  trustNote: { fontSize: Typography.xs, color: Colors.border, lineHeight: Typography.xs * 1.6 },

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
