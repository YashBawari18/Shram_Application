import { create } from 'zustand'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import { WorkerAvailability } from '../types/app'

interface WorkerStore {
  availability: WorkerAvailability | null
  isLoading: boolean
  locationError: string | null

  fetchAvailability: (workerId: string) => Promise<void>
  goOnline: (workerId: string, wage: number) => Promise<{ success: boolean; error?: string }>
  goOffline: (workerId: string) => Promise<void>
  updateWage: (workerId: string, wage: number) => Promise<void>
}

export const useWorkerStore = create<WorkerStore>((set, get) => ({
  availability: null,
  isLoading: false,
  locationError: null,

  fetchAvailability: async (workerId) => {
    const { data } = await supabase
      .from('worker_availability')
      .select('*')
      .eq('worker_id', workerId)
      .single()
    if (data) {
      set({
        availability: {
          ...data,
          location: data.location as any,
        },
      })
    }
  },

  goOnline: async (workerId, wage) => {
    set({ isLoading: true, locationError: null })

    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      set({ isLoading: false, locationError: 'Location permission is required to go online.' })
      return { success: false, error: 'Location permission denied.' }
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    const { latitude, longitude } = loc.coords

    // Reverse geocode for human label
    let locationName = 'Current location'
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude })
      locationName = [place.name, place.district, place.city].filter(Boolean).join(', ')
    } catch {}

    const { error } = await supabase
      .from('worker_availability')
      .upsert({
        worker_id: workerId,
        is_online: true,
        // PostGIS expects POINT(lng lat)
        location: `POINT(${longitude} ${latitude})`,
        location_name: locationName,
        today_wage: wage,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'worker_id' })

    set({ isLoading: false })
    if (error) return { success: false, error: error.message }

    // Refresh local state
    await get().fetchAvailability(workerId)
    return { success: true }
  },

  goOffline: async (workerId) => {
    await supabase
      .from('worker_availability')
      .update({ is_online: false, updated_at: new Date().toISOString() })
      .eq('worker_id', workerId)

    set(state => ({
      availability: state.availability
        ? { ...state.availability, is_online: false }
        : null,
    }))
  },

  updateWage: async (workerId, wage) => {
    await supabase
      .from('worker_availability')
      .update({ today_wage: wage })
      .eq('worker_id', workerId)

    set(state => ({
      availability: state.availability
        ? { ...state.availability, today_wage: wage }
        : null,
    }))
  },
}))
