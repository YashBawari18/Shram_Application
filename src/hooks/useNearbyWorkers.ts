import { useEffect, useState, useCallback } from 'react'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import { NearbyWorker, Skill } from '../types/app'

interface Filters {
  skill?: Skill | null
  maxWage?: number | null
  radiusKm?: number
}

interface UseNearbyWorkersResult {
  workers: NearbyWorker[]
  isLoading: boolean
  error: string | null
  refresh: () => void
  userLocation: { lat: number; lng: number } | null
}

export function useNearbyWorkers(filters: Filters = {}): UseNearbyWorkersResult {
  const [workers, setWorkers] = useState<NearbyWorker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const { skill, maxWage, radiusKm = 5 } = filters

  const fetchWorkers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // Get contractor's current location
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      setError('Location permission needed to see nearby workers.')
      setIsLoading(false)
      return
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    const { latitude: lat, longitude: lng } = loc.coords
    setUserLocation({ lat, lng })

    // Call Supabase RPC — nearby_workers function (see migration 002)
    const { data, error: rpcError } = await supabase.rpc('get_nearby_workers', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radiusKm,
      filter_skill: skill || undefined,
      max_wage: maxWage || undefined,
    })

    if (rpcError) {
      setError(rpcError.message)
    } else {
      setWorkers((data ?? []) as NearbyWorker[])
    }
    setIsLoading(false)
  }, [skill, maxWage, radiusKm])

  useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  // Realtime: re-fetch when any worker's availability changes
  useEffect(() => {
    const channel = supabase
      .channel('nearby-workers-watch')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'worker_availability' },
        () => { fetchWorkers() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchWorkers])

  return { workers, isLoading, error, refresh: fetchWorkers, userLocation }
}
