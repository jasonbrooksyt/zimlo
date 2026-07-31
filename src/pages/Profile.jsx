import { useNavigate } from 'react-router-dom'
import { User, LogOut, Globe, Info, Phone, ChevronRight, MapPin, Pencil, Share2 } from 'lucide-react'
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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/home?ref=1`
    const shareData = {
      title: 'Zimlo',
      text: t(
        'Zimlo try karo — Jo Chaho, Jahan Chaho, Zimlo Laayega! Mera link se order karo aur delivery par ₹20 off pao 🎉',
        'Try Zimlo — order what you need, right to your door! Use my link for ₹20 off delivery on your first order 🎉'
      ),
      url: shareUrl
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // user cancelled the share sheet — nothing to do
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert(t('लिंक कॉपी हो गया!', 'Link copied!'))
    }
  }

  return (
    <div className="app-shell pb-24">
      <Header title="Profile" titleHi="प्रोफाइल" />

      <div className="px-4 pt-2">
        <button
          onClick={() => navigate('/edit-profile')}
          className="w-full flex items-center gap-4 bg-white rounded-2xl shadow-card p-4 mb-5"
        >
          <div className="relative w-14 h-14 shrink-0">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={26} className="text-primary" />
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Pencil size={10} className="text-white" />
            </span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-display font-700 text-ink truncate">{user?.name || 'Zimlo Customer'}</p>
            {user?.phone && <p className="text-sm text-ink/50">+91 {user.phone}</p>}
            {user?.email && <p className="text-xs text-ink/40 truncate">{user.email}</p>}
          </div>
          <ChevronRight size={18} className="text-ink/30 shrink-0" />
        </button>

        <div className="bg-white rounded-2xl shadow-card divide-y divide-black/5 overflow-hidden mb-5">
          <button
            onClick={() => navigate('/addresses')}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <MapPin size={20} className="text-ink/60" />
            <span className="flex-1 font-medium text-sm text-ink">
              {t('मेरे पते', 'My Addresses')}
            </span>
            <ChevronRight size={16} className="text-ink/30" />
          </button>
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <Share2 size={20} className="text-ink/60" />
            <span className="flex-1 font-medium text-sm text-ink">
              {t('Zimlo शेयर करें', 'Share Zimlo')}
            </span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              ₹20 OFF
            </span>
          </button>
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
            onClick={() => navigate('/about')}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <Info size={20} className="text-ink/60" />
            <span className="flex-1 font-medium text-sm text-ink">
              {t('हमारे बारे में', 'About Us')}
            </span>
            <ChevronRight size={16} className="text-ink/30" />
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <Phone size={20} className="text-ink/60" />
            <span className="flex-1 font-medium text-sm text-ink">
              {t('संपर्क करें', 'Contact Us')}
            </span>
            <ChevronRight size={16} className="text-ink/30" />
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
