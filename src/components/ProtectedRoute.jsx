import { Navigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// Guards customer-only routes. Redirects to OTP login if not authenticated.
export function ProtectedRoute({ children }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// Guards /admin/* routes. Redirects to the admin login screen.
export function AdminProtectedRoute({ children }) {
  const isAdminAuthenticated = useStore((s) => s.isAdminAuthenticated)
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}
