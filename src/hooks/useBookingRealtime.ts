import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useBookingStore } from '../stores/bookingStore'
import { InstantBooking } from '../types/app'

/**
 * Subscribes to instant_bookings changes for this user.
 * For workers: receives incoming requests.
 * For contractors: receives status updates (accepted/rejected).
 */
export function useBookingRealtime(userId: string, role: 'worker' | 'contractor') {
  const { addOrUpdate, fetchBookings } = useBookingStore()

  useEffect(() => {
    if (!userId) return

    const field = role === 'worker' ? 'worker_id' : 'contractor_id'

    const channel = supabase
      .channel(`bookings-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instant_bookings',
          filter: `${field}=eq.${userId}`,
        },
        (payload) => {
          const booking = (payload.new || payload.old) as InstantBooking
          if (booking) addOrUpdate(booking)
        }
      )
      .subscribe()

    // Initial load
    fetchBookings(userId, role)

    return () => { supabase.removeChannel(channel) }
  }, [userId, role])
}
