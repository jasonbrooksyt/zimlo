import { ArrowLeft, Languages } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// Reusable top bar. Pass `back` to show a back arrow + page title (used on
// every inner screen). With no title/back, this renders the Home landing
// header instead — a filled orange bar with the logo and a short greeting,
// so it reads as a proper app header rather than a mostly-empty strip.
export default function Header({ title, titleHi, back = false }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const toggleLanguage = useStore((s) => s.toggleLanguage)
  const isHome = !back && !title && !titleHi

  if (isHome) {
    return (
      <header className="sticky top-0 z-30 bg-gradient-to-r from-primary to-primary-dark px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Zimlo" className="h-11 w-11 rounded-full object-cover shadow-md shrink-0" />
          <div className="leading-tight">
            <p className="font-display font-800 text-white text-base">Zimlo</p>
            <p className="text-white/85 text-[11px] font-medium">
              {language === 'hi' ? 'भूख लगी? यहीं ऑर्डर करो' : "Order what you need, right here"}
            </p>
          </div>
        </div>

        <button
          onClick={toggleLanguage}
          aria-label="Toggle language"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/95 shadow-card text-xs font-bold text-ink active:scale-95 transition shrink-0"
        >
          <Languages size={14} />
          {language === 'hi' ? 'EN' : 'हिं'}
        </button>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-cream/95 backdrop-blur border-b border-black/5">
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
