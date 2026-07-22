import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, AlertTriangle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'

// Real admin login via Supabase Auth (email + password). The admin account
// itself is created once, manually, from the Supabase Dashboard ->
// Authentication -> Users -> "Add user" — there's no public admin sign-up
// screen, which is intentional (keeps the dashboard access private).
export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (signInError) {
      setError('Invalid email or password')
      return
    }
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Zimlo" className="w-20 h-20 mx-auto object-contain mb-2" />
          <h1 className="font-display font-800 text-2xl text-primary">Zimlo Admin</h1>
          <p className="text-ink/50 text-sm mt-1">Order & menu management dashboard</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Supabase env vars aren't set. Add them locally (.env) or in Vercel Project Settings
              before logging in.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 bg-cream rounded-xl px-4 py-3">
            <Mail size={18} className="text-ink/40" />
            <input
              type="email"
              placeholder="admin@zimlo.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="flex-1 outline-none bg-transparent text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 bg-cream rounded-xl px-4 py-3">
            <Lock size={18} className="text-ink/40" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="flex-1 outline-none bg-transparent text-sm font-medium"
            />
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
