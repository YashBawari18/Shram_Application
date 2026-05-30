import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { InstantBooking, BookingStatus } from '../types/app'

interface BookingStore {
  activeBookings: InstantBooking[]
  pendingRequests: InstantBooking[]
  isLoading: boolean

  fetchBookings: (userId: string, role: 'worker' | 'contractor') => Promise<void>
  updateStatus: (bookingId: string, status: BookingStatus) => Promise<{ success: boolean; error?: string }>
  addOrUpdate: (booking: InstantBooking) => void
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  activeBookings: [],
  pendingRequests: [],
  isLoading: false,

  fetchBookings: async (userId, role) => {
    set({ isLoading: true })
    const field = role === 'worker' ? 'worker_id' : 'contractor_id'

    const { data } = await supabase
      .from('instant_bookings')
      .select('*')
      .eq(field, userId)
      .in('status', ['pending', 'accepted', 'started'])
      .order('created_at', { ascending: false })

    const bookings = (data ?? []) as InstantBooking[]
    set({
      pendingRequests: bookings.filter(b => b.status === 'pending'),
      activeBookings: bookings.filter(b => ['accepted', 'started'].includes(b.status)),
      isLoading: false,
    })
  },

  updateStatus: async (bookingId, status) => {
    const { error } = await supabase
      .from('instant_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) return { success: false, error: error.message }

    // Update local state immediately (optimistic)
    set(state => ({
      pendingRequests: state.pendingRequests.filter(b => b.id !== bookingId),
      activeBookings: status === 'accepted' || status === 'started'
        ? [
            ...state.activeBookings.filter(b => b.id !== bookingId),
            { ...state.pendingRequests.find(b => b.id === bookingId)!, status },
          ]
        : state.activeBookings.filter(b => b.id !== bookingId),
    }))

    return { success: true }
  },

  addOrUpdate: (booking) => {
    set(state => {
      const isActive = ['accepted', 'started'].includes(booking.status)
      const isPending = booking.status === 'pending'

      return {
        pendingRequests: isPending
          ? [booking, ...state.pendingRequests.filter(b => b.id !== booking.id)]
          : state.pendingRequests.filter(b => b.id !== booking.id),
        activeBookings: isActive
          ? [booking, ...state.activeBookings.filter(b => b.id !== booking.id)]
          : state.activeBookings.filter(b => b.id !== booking.id),
      }
    })
  },
}))
