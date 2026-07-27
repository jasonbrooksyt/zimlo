import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// A customer's saved delivery addresses — lets them pick a past address
// instead of retyping it every time on Checkout / Request forms. Tied to
// their real Supabase identity, so it survives across visits on the same
// device (and, once logged in with the same Google account elsewhere,
// follows them there too).
export function useAddresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setLoading(true)
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setAddresses(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  // Saves a new address if it's not an exact duplicate of one already saved.
  // coords is optional: { latitude, longitude } from the GPS picker.
  const saveAddress = useCallback(
    async (addressText, label = 'Other', coords = null) => {
      if (!isSupabaseConfigured || !addressText?.trim()) return
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) return

      const trimmed = addressText.trim()
      const alreadySaved = addresses.some((a) => a.address_line.trim() === trimmed)
      if (alreadySaved) return

      await supabase.from('addresses').insert({
        user_id: authData.user.id,
        label,
        address_line: trimmed,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null
      })
      refetch()
    },
    [addresses, refetch]
  )

  const updateAddress = useCallback(
    async (id, updates) => {
      const payload = {}
      if (updates.label !== undefined) payload.label = updates.label
      if (updates.addressText !== undefined) payload.address_line = updates.addressText.trim()
      if (updates.latitude !== undefined) payload.latitude = updates.latitude
      if (updates.longitude !== undefined) payload.longitude = updates.longitude

      const { error } = await supabase.from('addresses').update(payload).eq('id', id)
      if (!error) refetch()
      return { error }
    },
    [refetch]
  )

  const deleteAddress = useCallback(
    async (id) => {
      await supabase.from('addresses').delete().eq('id', id)
      refetch()
    },
    [refetch]
  )

  return { addresses, loading, saveAddress, updateAddress, deleteAddress, refetch }
}
