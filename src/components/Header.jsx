import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Languages, Menu, MapPin, Bell, ChevronDown, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { SERVICE_AREAS } from '../data/menuData'
import SideDrawer from './SideDrawer'

export default function Header({ title, titleHi, back = false }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const toggleLanguage = useStore((s) => s.toggleLanguage)
  const serviceArea = useStore((s) => s.serviceArea)
  const setServiceArea = useStore((s) => s.setServiceArea)
  const getUnreadNotifCount = useStore((s) => s.getUnreadNotifCount)
  const isHome = !back && !title && !titleHi
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [areaOpen, setAreaOpen] = useState(false)
  const areaRef = useRef(null)

  const currentArea = SERVICE_AREAS.find((a) => a.id === serviceArea) || SERVICE_AREAS[0]
  const unreadNotifCount = getUnreadNotifCount()

  // Close area dropdown on outside click
  useEffect(() => {
    if (!areaOpen) return
    const onDoc = (e) => {
      if (areaRef.current && !areaRef.current.contains(e.target)) setAreaOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [areaOpen])

  if (isHome) {
    return (
      <>
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-3 pt-2.5 pb-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_0_rgba(255,152,0,0.12)] border-b border-primary/10">
          <div className="flex items-center justify-between gap-1">
            {/* Left: menu + logo + brand */}
            <div className="flex items-center gap-1 min-w-0">
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Menu"
                className="w-9 h-9 flex items-center justify-center rounded-full active:bg-black/5 transition shrink-0"
              >
                <Menu size={22} className="text-ink" strokeWidth={2.2} />
              </button>
              <img
                src="/logo.png"
                alt="Zimlo"
                className="h-11 w-11 object-contain shrink-0 drop-shadow-sm"
                draggable={false}
              />
              <div className="min-w-0 leading-tight">
                <p className="font-display font-800 text-[15px] text-ink tracking-tight flex items-center gap-0.5">
                  <span className="text-base leading-none" aria-hidden>
                    🛵
                  </span>
                  <span>
                    <span className="text-ink">Zi</span>
                    <span className="text-primary">MLO</span>
                  </span>
                </p>
                <p className="text-[9px] text-ink/40 font-medium truncate max-w-[90px]">
                  {tLabel(language)}
                </p>
              </div>
            </div>

            {/* Right: area dropdown + bell + lang */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="relative" ref={areaRef}>
                <button
                  type="button"
                  onClick={() => setAreaOpen((v) => !v)}
                  className="flex items-center gap-1 bg-[#FFF3E0] text-ink pl-2 pr-1.5 py-1.5 rounded-full active:scale-95 transition shadow-sm max-w-[118px]"
                >
                  <MapPin size={12} className="text-primary shrink-0" />
                  <span className="text-[11px] font-bold truncate">
                    {language === 'hi' ? currentArea.nameHi : currentArea.name}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-ink/40 shrink-0 transition-transform ${areaOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {areaOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.14)] border border-black/[0.06] py-1.5 z-50 overflow-hidden">
                    {SERVICE_AREAS.map((area) => {
                      const active = serviceArea === area.id
                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => {
                            setServiceArea(area.id)
                            setAreaOpen(false)
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[13px] font-semibold transition ${
                            active
                              ? 'bg-primary/10 text-primary'
                              : 'text-ink hover:bg-black/[0.03]'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <MapPin size={13} className={active ? 'text-primary' : 'text-ink/35'} />
                            {language === 'hi' ? area.nameHi : area.name}
                          </span>
                          {active && <Check size={14} className="text-primary shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/notifications')}
                aria-label="Notifications / Orders"
                className="relative w-9 h-9 flex items-center justify-center rounded-full active:bg-black/5 transition"
              >
                <Bell size={20} className="text-ink/70" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <button
                onClick={toggleLanguage}
                aria-label="Toggle language"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary active:scale-95 transition"
              >
                {language === 'hi' ? 'EN' : 'हिं'}
              </button>
            </div>
          </div>
        </header>
        <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur border-b border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
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

function tLabel(language) {
  return language === 'hi' ? 'जो चाहो, जहाँ चाहो' : 'Jo Chaho, Jahan Chaho'
}
