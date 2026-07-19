import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User } from 'lucide-react'
import { useStore } from '../../store/useStore'

// Simple username/password gate for the /admin dashboard.
// Demo credentials: admin / zimlo123
export default function AdminLogin() {
  const navigate = useNavigate()
  const adminLogin = useStore((s) => s.adminLogin)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const success = adminLogin(username, password)
    if (success) {
      navigate('/admin/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Zimlo" className="w-20 h-20 mx-auto object-contain mb-2" />
          <h1 className="font-display font-800 text-2xl text-primary">Zimlo Admin</h1>
          <p className="text-ink/50 text-sm mt-1">Order management dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 bg-cream rounded-xl px-4 py-3">
            <User size={18} className="text-ink/40" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              className="flex-1 outline-none bg-transparent text-sm font-medium"
            />
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 rounded-xl active:scale-[0.98] transition"
          >
            Log In
          </button>
          <p className="text-center text-xs text-ink/30">Demo: admin / zimlo123</p>
        </form>
      </div>
    </div>
  )
}
