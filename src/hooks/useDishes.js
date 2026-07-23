import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { DISHES as FALLBACK_DISHES } from '../data/menuData'

// Live menu data, backed by Supabase's `dishes` table.
// Every customer screen (FoodSubcategories, DishList) uses this hook so
// that a price/name change made by the admin shows up everywhere within
// seconds — via Supabase Realtime — without anyone needing to refresh.
//
// If Supabase isn't configured yet (env vars missing), this quietly falls
// back to the bundled demo dishes from menuData.js so local dev / previews
// still work before the database is wired up.
export function useDishes() {
  const [dishes, setDishes] = useState(isSupabaseConfigured ? [] : FALLBACK_DISHES)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('dishes')
      .select('*')
      .order('subcategory', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    // Map DB snake_case (name_hi) to the app's existing camelCase shape
    // (nameHi) so every component that already expects dish.nameHi keeps working.
    setDishes(
      data.map((row) => ({
        id: row.id,
        subcategory: row.subcategory,
        name: row.name,
        nameHi: row.name_hi,
        price: row.price,
        veg: row.veg,
        img: row.img,
        imageUrl: row.image_url || null,
        description: row.description || ''
      }))
    )
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    refetch()

    // Live updates: any insert/update/delete on `dishes` re-fetches for
    // every open tab (customer or admin) subscribed to this channel.
    const channel = supabase
      .channel('dishes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, () => {
        refetch()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  return { dishes, loading, error, refetch }
}
