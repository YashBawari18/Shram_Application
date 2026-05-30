const SHRAM_DOMAIN = 'shram.app'

/**
 * Maps a phone number to a deterministic dummy email.
 * This is the ONLY place this transformation happens.
 *
 * +919876543210 → +919876543210@shram.app
 *
 * The user never sees this email. Supabase uses it internally.
 */
export function phoneToEmail(phone: string): string {
  // Normalize: strip spaces, dashes, brackets
  const normalized = phone.replace(/[\s\-\(\)]/g, '')
  // Ensure it starts with +91 for India
  const withCountry = normalized.startsWith('+') ? normalized : `+91${normalized}`
  return `${withCountry}@${SHRAM_DOMAIN}`
}

/**
 * Extracts the phone number back from a dummy email.
 * Used for display purposes only.
 */
export function emailToPhone(email: string): string {
  return email.replace(`@${SHRAM_DOMAIN}`, '')
}

/**
 * Validates an Indian mobile number (10 digits, starts with 6-9).
 */
export function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits)
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(digits.slice(2))
  }
  return false
}

/**
 * Formats a raw number for display: 9876543210 → +91 98765 43210
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^91/, '')
  if (digits.length !== 10) return phone
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}
