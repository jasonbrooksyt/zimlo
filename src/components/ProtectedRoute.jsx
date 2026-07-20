import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

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

// Guards /admin/* routes. Redirects to the admin login screen.
export function AdminProtectedRoute({ children }) {
  const isAdminAuthenticated = useStore((s) => s.isAdminAuthenticated)
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}
