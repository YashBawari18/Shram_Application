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
import { router } from 'expo-router'
import { signIn } from '../../src/lib/auth'
import { isValidIndianPhone } from '../../src/utils/phoneEmail'
import { Button } from '../../src/components/ui/Button'
import { TextInput } from '../../src/components/ui/TextInput'
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme'

export default function LoginScreen() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({})

  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!isValidIndianPhone(phone)) {
      newErrors.phone = 'Enter a valid 10-digit mobile number'
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleLogin() {
    if (!validate()) return
    setLoading(true)

    const result = await signIn(phone, password)
    setLoading(false)

    if (!result.success) {
      Alert.alert('Login Failed', result.error)
    }
    // On success, authStore triggers RouteGuard which navigates automatically
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>श्रम</Text>
            </View>
            <Text style={styles.appName}>SHRAM</Text>
            <Text style={styles.tagline}>डिजिटल नाका — काम मिले, आसानी से</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>लॉग इन करें</Text>
            <Text style={styles.subtitle}>अपना मोबाइल नंबर डालें</Text>

            <TextInput
              label="मोबाइल नंबर"
              placeholder="98765 43210"
              prefix="+91"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
              error={errors.phone}
              autoComplete="tel"
              returnKeyType="next"
            />

            <TextInput
              label="पासवर्ड"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              suffix={
                <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                  <Text style={styles.showHide}>{showPassword ? 'छुपाएं' : 'दिखाएं'}</Text>
                </TouchableOpacity>
              }
            />

            <Button
              label="लॉग इन करें"
              onPress={handleLogin}
              loading={loading}
              style={styles.cta}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              style={styles.signupLink}
            >
              <Text style={styles.signupText}>
                नया अकाउंट बनाएं{' '}
                <Text style={styles.signupBold}>Sign Up →</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            By continuing, you agree to Shram's Terms of Service
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
  },

  header: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: Typography.black,
    color: Colors.black,
  },
  appName: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.black,
    color: Colors.black,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  form: { flex: 1 },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
  },

  cta: { marginTop: Spacing.sm },

  showHide: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: Typography.sm, color: Colors.textMuted },

  signupLink: { alignItems: 'center' },
  signupText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  signupBold: {
    color: Colors.primary,
    fontWeight: Typography.bold,
  },

  footer: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
})
