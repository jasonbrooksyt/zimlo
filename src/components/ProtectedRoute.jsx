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

// Guards /admin/* routes using a REAL Supabase Auth session — this is what
// actually protects database writes (menu edits, order pricing), since
// Row Level Security on the backend only allows those for signed-in users.
// A client-side-only flag can't secure that; the session token can.
export function AdminProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still checking

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null)
      return
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
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
