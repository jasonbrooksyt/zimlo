import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

async function ensureUserId() {
  if (!isSupabaseConfigured || !supabase) return null
  const { data } = await supabase.auth.getSession()
  if (data.session?.user?.id) return data.session.user.id

  // No session — create anonymous so RLS can pass (same pattern as orders)
  const { data: anonData, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.error('useAddresses: anonymous sign-in failed:', error.message)
    return null
  }
  return anonData.session?.user?.id || null
}

// A customer's saved delivery addresses — lets them pick a past address
// instead of retyping it every time on Checkout / Request forms. Tied to
// their real Supabase identity, so it survives across visits on the same
// device (and, once logged in with the same Google account elsewhere,
// follows them there too).
export function useAddresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [lastError, setLastError] = useState('')

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setLoading(true)
    const userId = await ensureUserId()
    if (!userId) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('useAddresses refetch failed:', error.message, error)
      setLastError(error.message)
    } else if (data) {
      setAddresses(data)
      setLastError('')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  // Saves a new address if it's not an exact duplicate of one already saved.
  // coords is optional: { latitude, longitude } from the GPS picker.
  // Returns { ok: true } or { ok: false, error: '...' }
  // fields: { fullName, addressLine, landmark, mobile } OR legacy string
  const saveAddress = useCallback(
    async (fieldsOrText, label = 'Other', coords = null) => {
      if (!isSupabaseConfigured) {
        return { ok: false, error: 'Supabase not configured' }
      }

      const fields =
        typeof fieldsOrText === 'string'
          ? { fullName: '', addressLine: fieldsOrText, landmark: '', mobile: '' }
          : fieldsOrText || {}

      const line = (fields.addressLine || '').trim()
      if (!line) {
        return { ok: false, error: 'Address is empty' }
      }

      const userId = await ensureUserId()
      if (!userId) {
        return {
          ok: false,
          error: 'Not signed in. Please log in again, then save the address.'
        }
      }

      const alreadySaved = addresses.some(
        (a) =>
          (a.address_line || '').trim() === line &&
          (a.full_name || '').trim() === (fields.fullName || '').trim()
      )
      if (alreadySaved) return { ok: true }

      const { error } = await supabase.from('addresses').insert({
        user_id: userId,
        label,
        address_line: line,
        full_name: (fields.fullName || '').trim() || null,
        landmark: (fields.landmark || '').trim() || null,
        mobile: (fields.mobile || '').trim() || null,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null
      })

      if (error) {
        console.error('saveAddress failed:', error.message, error)
        setLastError(error.message)
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          return {
            ok: false,
            error: 'Addresses table missing. Run addresses-setup.sql in Supabase.'
          }
        }
        if (error.message?.includes('full_name') || error.message?.includes('landmark') || error.message?.includes('mobile')) {
          return {
            ok: false,
            error: 'Run addresses-fields-setup.sql in Supabase (new columns).'
          }
        }
        return { ok: false, error: error.message }
      }

      setLastError('')
      await refetch()
      return { ok: true }
    },
    [addresses, refetch]
  )

  const updateAddress = useCallback(
    async (id, updates) => {
      const payload = {}
      if (updates.label !== undefined) payload.label = updates.label
      if (updates.addressText !== undefined) payload.address_line = updates.addressText.trim()
      if (updates.addressLine !== undefined) payload.address_line = updates.addressLine.trim()
      if (updates.fullName !== undefined) payload.full_name = updates.fullName.trim() || null
      if (updates.landmark !== undefined) payload.landmark = updates.landmark.trim() || null
      if (updates.mobile !== undefined) payload.mobile = updates.mobile.trim() || null
      if (updates.latitude !== undefined) payload.latitude = updates.latitude
      if (updates.longitude !== undefined) payload.longitude = updates.longitude

      const { error } = await supabase.from('addresses').update(payload).eq('id', id)
      if (error) {
        console.error('updateAddress failed:', error.message, error)
        setLastError(error.message)
        return { ok: false, error: error.message }
      }
      setLastError('')
      await refetch()
      return { ok: true }
    },
    [refetch]
  )

  const deleteAddress = useCallback(
    async (id) => {
      const { error } = await supabase.from('addresses').delete().eq('id', id)
      if (error) {
        console.error('deleteAddress failed:', error.message, error)
        setLastError(error.message)
        return { ok: false, error: error.message }
      }
      setLastError('')
      await refetch()
      return { ok: true }
    },
    [refetch]
  )

  return { addresses, loading, lastError, saveAddress, updateAddress, deleteAddress, refetch }
}
