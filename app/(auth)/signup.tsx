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
import { signUp } from '../../src/lib/auth'
import { isValidIndianPhone } from '../../src/utils/phoneEmail'
import { Button } from '../../src/components/ui/Button'
import { TextInput } from '../../src/components/ui/TextInput'
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme'

export default function SignupScreen() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!isValidIndianPhone(phone)) {
      newErrors.phone = 'Enter a valid 10-digit mobile number'
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSignup() {
    if (!validate()) return
    setLoading(true)

    const result = await signUp(phone, password)
    setLoading(false)

    if (!result.success) {
      Alert.alert('Sign Up Failed', result.error)
      return
    }

    // Auth state change will trigger RouteGuard → role-select
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
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← वापस जाएं</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>श्रम</Text>
            </View>
            <Text style={styles.title}>नया अकाउंट बनाएं</Text>
            <Text style={styles.subtitle}>
              अपना मोबाइल नंबर और पासवर्ड डालें
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="मोबाइल नंबर"
              placeholder="98765 43210"
              prefix="+91"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
              error={errors.phone}
              hint="यही नंबर आपका ID होगा"
              autoComplete="tel"
              returnKeyType="next"
            />

            <TextInput
              label="पासवर्ड बनाएं"
              placeholder="कम से कम 6 अक्षर"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              returnKeyType="next"
              suffix={
                <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                  <Text style={styles.showHide}>{showPassword ? 'छुपाएं' : 'दिखाएं'}</Text>
                </TouchableOpacity>
              }
            />

            <TextInput
              label="पासवर्ड दोबारा डालें"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />

            <Button
              label="अकाउंट बनाएं"
              onPress={handleSignup}
              loading={loading}
              style={styles.cta}
            />

            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                पहले से अकाउंट है?{' '}
                <Text style={styles.loginBold}>Log In →</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },

  back: { marginBottom: Spacing.lg },
  backText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },

  header: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  logoText: {
    fontSize: 26,
    fontWeight: Typography.black,
    color: Colors.black,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  form: { flex: 1 },
  cta: { marginTop: Spacing.sm },

  showHide: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },

  loginLink: { alignItems: 'center', marginTop: Spacing.xl },
  loginText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  loginBold: {
    color: Colors.primary,
    fontWeight: Typography.bold,
  },
})
