import { useState } from 'react'
import { ArrowLeft, Languages, Menu, MapPin, Bell, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { SERVICE_AREAS } from '../data/menuData'
import SideDrawer from './SideDrawer'

// Reusable top bar. Pass `back` to show a back arrow + page title (used on
// every inner screen). With no title/back, this renders the Home landing
// header — hamburger, brand logo, location, notification bell.
export default function Header({ title, titleHi, back = false }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const toggleLanguage = useStore((s) => s.toggleLanguage)
  const serviceArea = useStore((s) => s.serviceArea)
  const orders = useStore((s) => s.orders)
  const user = useStore((s) => s.user)
  const isHome = !back && !title && !titleHi
  const [drawerOpen, setDrawerOpen] = useState(false)

  const currentArea = SERVICE_AREAS.find((a) => a.id === serviceArea) || SERVICE_AREAS[0]
  const activeOrderCount = orders.filter(
    (o) => o.customerPhone === user?.phone && o.status !== 'delivered'
  ).length

  if (isHome) {
    return (
      <>
        <header className="sticky top-0 z-30 bg-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setDrawerOpen(true)} aria-label="Menu" className="p-0.5">
              <Menu size={22} className="text-ink" strokeWidth={2.2} />
            </button>
            {/* Official Zimlo logo */}
            <img
              src="/logo.png"
              alt="Zimlo"
              className="h-10 w-auto object-contain"
              draggable={false}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                document.getElementById('area-chips')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest'
                })
              }}
              className="flex items-center gap-1 text-xs font-semibold text-ink/70"
            >
              <MapPin size={14} className="text-primary shrink-0" />
              <span className="max-w-[72px] truncate">
                {language === 'hi' ? currentArea.nameHi : currentArea.name}
              </span>
              <ChevronDown size={14} className="text-ink/40 shrink-0" />
            </button>
            <button
              onClick={() => navigate('/orders')}
              aria-label="Orders"
              className="relative p-0.5"
            >
              <Bell size={20} className="text-ink/70" />
              {activeOrderCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeOrderCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="text-[11px] font-bold text-primary px-1"
            >
              {language === 'hi' ? 'EN' : 'हिं'}
            </button>
          </div>
        </header>
        <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur border-b border-black/5">
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-card active:scale-95 transition shrink-0"
          >
            <ArrowLeft size={20} className="text-ink" />
          </button>
        )}
        <h1 className="font-display font-700 text-lg text-ink truncate">
          {language === 'hi' ? titleHi || title : title || titleHi}
        </h1>
      </div>

      <button
        onClick={toggleLanguage}
        aria-label="Toggle language"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white shadow-card text-xs font-semibold active:scale-95 transition shrink-0"
      >
        <Languages size={14} />
        {language === 'hi' ? 'EN' : 'हिं'}
      </button>
    </header>
  )
}
