import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// Ensures every visitor's browser has a real Supabase Auth session — using
// Anonymous Sign-In, which needs no phone/email/SMS provider. This is what
// makes Row Level Security able to enforce "you only see your own orders"
// (see supabase/orders-privacy-setup.sql), while the app's own OTP screen
// still just collects a display phone number for delivery/contact purposes.
//
// Mounted once at the top of the app (see App.jsx) so a session exists
// before the customer ever reaches Checkout or a Request form.
export function useCustomerSession() {
  useEffect(() => {
    if (!isSupabaseConfigured) return

    async function ensureSession() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        // No session yet (first visit, or an admin just signed out) —
        // create one anonymously. If this browser already has an admin's
        // real session active, we leave it alone.
        await supabase.auth.signInAnonymously()
      }
    }

    ensureSession()
  }, [])
}
