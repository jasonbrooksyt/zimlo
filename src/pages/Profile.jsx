import { useNavigate } from 'react-router-dom'
import { User, LogOut, Globe, ShieldCheck } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useStore } from '../store/useStore'

export default function Profile() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const toggleLanguage = useStore((s) => s.toggleLanguage)
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell pb-24">
      <Header title="Profile" titleHi="प्रोफाइल" />

      <div className="px-4 pt-2">
        <div className="flex items-center gap-4 bg-white rounded-2xl shadow-card p-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={26} className="text-primary" />
          </div>
          <div>
            <p className="font-display font-700 text-ink">{user?.name || 'Zimlo Customer'}</p>
            <p className="text-sm text-ink/50">+91 {user?.phone}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card divide-y divide-black/5 overflow-hidden mb-5">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <Globe size={20} className="text-ink/60" />
            <span className="flex-1 font-medium text-sm text-ink">
              {t('भाषा', 'Language')}
            </span>
            <span className="text-sm text-ink/50 font-semibold">
              {language === 'hi' ? 'हिंदी' : 'English'}
            </span>
          </button>
          <button
            onClick={() => navigate('/admin/login')}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <ShieldCheck size={20} className="text-ink/60" />
            <span className="flex-1 font-medium text-sm text-ink">
              {t('एडमिन लॉगिन', 'Admin Login')}
            </span>
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl shadow-card p-4 text-red-600 font-semibold text-sm"
        >
          <LogOut size={18} />
          {t('लॉग आउट', 'Log Out')}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
