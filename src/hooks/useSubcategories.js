import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { FOOD_SUBCATEGORIES as FALLBACK_SUBCATEGORIES } from '../data/menuData'

// Live Food subcategories (Fast Food, North Indian, etc.), backed by
// Supabase's `subcategories` table — same live-edit + realtime pattern as
// useDishes. Falls back to the bundled static list if Supabase isn't
// configured yet.
export function useSubcategories() {
  const [subcategories, setSubcategories] = useState(
    isSupabaseConfigured ? [] : FALLBACK_SUBCATEGORIES
  )
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('subcategories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setSubcategories(
      data.map((row) => ({
        id: row.id,
        name: row.name,
        nameHi: row.name_hi,
        emoji: row.emoji,
        color: row.color,
        sortOrder: row.sort_order
      }))
    )
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    refetch()
    const channel = supabase
      .channel('subcategories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subcategories' }, () => {
        refetch()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refetch])

  return { subcategories, loading, error, refetch }
}
