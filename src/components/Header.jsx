import { ArrowLeft, Languages } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// Reusable top bar. Pass `back` to show a back arrow instead of the logo,
// and `title`/`titleHi` for the page heading (switches with language toggle).
export default function Header({ title, titleHi, back = false, transparent = false }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const toggleLanguage = useStore((s) => s.toggleLanguage)

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between px-4 py-3 ${
        transparent ? 'bg-transparent' : 'bg-cream/95 backdrop-blur border-b border-black/5'
      }`}
    >
      <div className="flex items-center gap-2">
        {back ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-card active:scale-95 transition"
          >
            <ArrowLeft size={20} className="text-ink" />
          </button>
        ) : null}
        {title || titleHi ? (
          <h1 className="font-display font-700 text-lg text-ink">
            {language === 'hi' ? titleHi || title : title || titleHi}
          </h1>
        ) : (
          <img src="/logo.png" alt="Zimlo" className="h-9 w-auto" />
        )}
      </div>

      <button
        onClick={toggleLanguage}
        aria-label="Toggle language"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white shadow-card text-xs font-semibold active:scale-95 transition"
      >
        <Languages size={14} />
        {language === 'hi' ? 'EN' : 'हिं'}
      </button>
    </header>
  )
}
