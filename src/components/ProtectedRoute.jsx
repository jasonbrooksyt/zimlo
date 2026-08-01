import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// Guards customer routes that represent an actual "place order" action
// (Checkout, Request form, Orders, Profile, Tracking). Redirects to OTP
// login if not authenticated, and remembers where the user was headed so
// Login can send them straight back after verifying OTP.
export function ProtectedRoute({ children }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

// Guards /admin/* routes using a REAL (non-anonymous) Supabase Auth session.
// Anonymous customer sessions also count as "authenticated" to Supabase, so
// we must explicitly reject is_anonymous users — otherwise a regular customer
// could open /admin/dashboard and see the admin UI (writes are still blocked
// by RLS, but the UI itself must not load).
export function AdminProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still checking

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null)
      return
    }

    const isRealAdmin = (s) => s && s.user && !s.user.is_anonymous

    supabase.auth.getSession().then(({ data }) => {
      setSession(isRealAdmin(data.session) ? data.session : null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(isRealAdmin(newSession) ? newSession : null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <Loader2 size={28} className="text-primary animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />
  return children
}
