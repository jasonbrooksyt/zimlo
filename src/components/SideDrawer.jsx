import { useNavigate } from 'react-router-dom'
import { X, Home, ClipboardList, MapPin, User, Info, Phone, ShieldCheck } from 'lucide-react'
import { useStore } from '../store/useStore'

// Slide-out quick-links menu, opened from the hamburger icon in Home's header.
export default function SideDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const go = (path) => {
    onClose()
    navigate(path)
  }

  const items = [
    { icon: Home, label: t('होम', 'Home'), path: '/home' },
    { icon: ClipboardList, label: t('मेरे ऑर्डर', 'My Orders'), path: '/orders', needsAuth: true },
    { icon: MapPin, label: t('मेरे पते', 'My Addresses'), path: '/addresses', needsAuth: true },
    { icon: User, label: t('प्रोफाइल', 'Profile'), path: '/profile', needsAuth: true },
    { icon: Info, label: t('हमारे बारे में', 'About Us'), path: '/about' },
    { icon: Phone, label: t('संपर्क करें', 'Contact Us'), path: '/contact' },
    { icon: ShieldCheck, label: t('एडमिन लॉगिन', 'Admin Login'), path: '/admin/login' }
  ]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-72 max-w-[80%] bg-white h-full shadow-2xl animate-slide-up flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <img src="/logo.png" alt="Zimlo" className="h-10 w-auto" />
          <button onClick={onClose} aria-label="Close menu">
            <X size={22} className="text-ink/60" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {items.map((item) => {
            if (item.needsAuth && !isAuthenticated) return null
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left active:bg-cream transition"
              >
                <item.icon size={19} className="text-ink/60" />
                <span className="text-sm font-medium text-ink">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex-1 bg-black/40" />
    </div>
  )
}
