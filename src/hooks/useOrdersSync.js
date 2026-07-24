import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { useStore } from '../store/useStore'

// Keeps the store's `orders` array live: fetches once on mount, then
// re-fetches whenever ANY order changes in Supabase — a status update from
// the Admin Dashboard on one device shows up on the customer's phone
// within a second or two, without them refreshing.
// Mounted once, at the top of the app (see App.jsx), so it's active
// regardless of which route is showing.
export function useOrdersSync() {
  const fetchOrders = useStore((s) => s.fetchOrders)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    fetchOrders()

    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    // Also re-fetch when auth state changes (e.g. the anonymous session
    // from useCustomerSession finishes setting up just after this hook's
    // first fetch, or an admin logs in/out) — otherwise the very first
    // fetch can race ahead of having a session and come back empty.
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchOrders()
    })

    return () => {
      supabase.removeChannel(channel)
      authListener.subscription.unsubscribe()
    }
  }, [fetchOrders])
}
