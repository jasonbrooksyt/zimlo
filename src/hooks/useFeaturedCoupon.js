import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// Grabs one active coupon to feature on the Home screen promo banner —
// real data from the admin-editable `coupons` table, not hardcoded, so
// whatever the admin creates/activates shows up here automatically.
export function useFeaturedCoupon() {
  const [coupon, setCoupon] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false
    supabase
      .from('coupons')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (cancelled) return
        if (data && data[0]) setCoupon(data[0])
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { coupon, loading }
}
