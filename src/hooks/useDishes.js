import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { DISHES as FALLBACK_DISHES } from '../data/menuData'

// Live menu data, backed by Supabase's `dishes` table.
// Every customer screen (FoodSubcategories, DishList) uses this hook so
// that a price/name change made by the admin shows up everywhere within
// seconds — via Supabase Realtime — without anyone needing to refresh.
//
// Also merges in REAL customer ratings from `dish_ratings` (avgRating,
// ratingCount per dish) — replaces the old deterministic/fake rating that
// used to be shown on every dish card.
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

    const [dishesRes, ratingsRes] = await Promise.all([
      supabase.from('dishes').select('*').order('subcategory', { ascending: true }),
      supabase.from('dish_ratings').select('dish_id, rating')
    ])

    if (dishesRes.error) {
      setError(dishesRes.error.message)
      setLoading(false)
      return
    }

    // Aggregate ratings per dish client-side — simplest approach for this
    // scale, avoids needing a Postgres view just for an average + count.
    const ratingTotals = {} // { dishId: { sum, count } }
    ;(ratingsRes.data || []).forEach((r) => {
      if (!ratingTotals[r.dish_id]) ratingTotals[r.dish_id] = { sum: 0, count: 0 }
      ratingTotals[r.dish_id].sum += r.rating
      ratingTotals[r.dish_id].count += 1
    })

    // Map DB snake_case (name_hi) to the app's existing camelCase shape
    // (nameHi) so every component that already expects dish.nameHi keeps working.
    setDishes(
      dishesRes.data.map((row) => {
        const agg = ratingTotals[row.id]
        return {
          id: row.id,
          subcategory: row.subcategory,
          name: row.name,
          nameHi: row.name_hi,
          price: row.price,
          veg: row.veg,
          img: row.img,
          imageUrl: row.image_url || null,
          description: row.description || '',
          avgRating: agg ? agg.sum / agg.count : 0,
          ratingCount: agg ? agg.count : 0
        }
      })
    )
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    refetch()

    // Live updates: any insert/update/delete on `dishes` OR new ratings
    // re-fetches for every open tab (customer or admin) subscribed here.
    const dishesChannel = supabase
      .channel('dishes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, () => {
        refetch()
      })
      .subscribe()

    const ratingsChannel = supabase
      .channel('dish-ratings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dish_ratings' }, () => {
        refetch()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(dishesChannel)
      supabase.removeChannel(ratingsChannel)
    }
  }, [refetch])

  return { dishes, loading, error, refetch }
}
