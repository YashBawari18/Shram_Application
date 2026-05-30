export function formatWage(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatWagePerDay(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')} / दिन`
}
