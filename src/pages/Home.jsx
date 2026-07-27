import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Mic, ChevronRight, Check, Copy } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CartBar from '../components/CartBar'
import CategoryCard from '../components/CategoryCard'
import VegToggle from '../components/VegToggle'
import WhatsAppButton from '../components/WhatsAppButton'
import { CATEGORIES, SERVICE_AREAS } from '../data/menuData'
import { useStore } from '../store/useStore'
import { useSubcategories } from '../hooks/useSubcategories'
import { useFeaturedCoupon } from '../hooks/useFeaturedCoupon'

// Each slide is a full banner photo (customer-provided, brand-baked-in)
// that links straight to the matching category when tapped.
const BANNER_SLIDES = [
  { image: '/banner-hero.jpg', link: '/food' },
  { image: '/banner-food.jpg', link: '/food' },
  { image: '/banner-grocery.jpg', link: '/request/grocery' },
  { image: '/banner-medicine.jpg', link: '/request/medicine' }
]

export default function Home() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const serviceArea = useStore((s) => s.serviceArea)
  const setServiceArea = useStore((s) => s.setServiceArea)
  const vegOnly = useStore((s) => s.vegOnly)
  const toggleVegOnly = useStore((s) => s.toggleVegOnly)
  const { subcategories } = useSubcategories()
  const featuredCoupon = useFeaturedCoupon()
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [slide, setSlide] = useState(0)
  const [listening, setListening] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % BANNER_SLIDES.length), 4500)
    return () => clearInterval(timer)
  }, [])

  const handleMicSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      navigate('/food')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = () => navigate('/food')
    recognition.onerror = () => setListening(false)
    recognition.start()
  }

  const handleCopyCoupon = () => {
    if (!featuredCoupon) return
    navigator.clipboard.writeText(featuredCoupon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="app-shell pb-28">
      <Header />

      <div className="px-4 pt-3 pb-4">
        {/* Delivery area chips — all shown together, no dropdown */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {SERVICE_AREAS.map((area) => {
            const isActive = serviceArea === area.id
            return (
              <button
                key={area.id}
                onClick={() => setServiceArea(area.id)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-semibold shrink-0 transition ${
                  isActive ? 'bg-primary text-white shadow-pop' : 'bg-white text-ink/60 shadow-card'
                }`}
              >
                {isActive && <Check size={13} />}
                {language === 'hi' ? area.nameHi : area.name}
              </button>
            )
          })}
        </div>

        {/* Banner carousel */}
        <div className="relative bg-ink rounded-2xl overflow-hidden mb-4 shadow-pop aspect-[16/9]">
          {BANNER_SLIDES.map((s, i) => (
            <button
              key={s.link + i}
              onClick={() => navigate(s.link)}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img src={s.image} alt="Zimlo" className="w-full h-full object-cover" />
            </button>
          ))}

          {/* Carousel dots — single source of truth; banner images should NOT bake their own dots in */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 py-3 bg-gradient-to-t from-ink/70 to-transparent z-20">
            {BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-5 bg-primary' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Search bar with mic + veg toggle */}
        <div className="flex items-center gap-2 mb-3">
          <div
            onClick={() => navigate('/food')}
            className="flex-1 flex items-center gap-2 bg-white rounded-2xl shadow-card px-4 py-3 cursor-pointer"
          >
            <Search size={18} className="text-ink/40 shrink-0" />
            <span className="flex-1 text-sm text-ink/35">
              {t('खाना या आइटम खोजें', 'Search for food or item')}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleMicSearch()
              }}
              aria-label="Voice search"
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition ${
                listening ? 'bg-red-500 animate-pulse' : 'bg-primary'
              }`}
            >
              <Mic size={14} className="text-white" />
            </button>
          </div>
          <div className="shrink-0">
            <VegToggle checked={vegOnly} onChange={toggleVegOnly} label={t('वेज', 'Veg')} />
          </div>
        </div>

        {/* Shop by category */}
        <h2 className="font-display font-700 text-base text-ink mb-3">
          {t('कैटेगरी से खरीदें', 'Shop by Category')}
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-7">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>

        {/* Food cuisines — horizontal scroll teaser into the Food catalogue */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-700 text-base text-ink">
            {t('क्या खाना है?', 'What are you craving?')}
          </h2>
          <button onClick={() => navigate('/food')} className="flex items-center text-primary text-xs font-semibold">
            {t('सब देखें', 'See all')} <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 mb-6">
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => navigate(`/food/${sub.id}`)}
              className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-card flex items-center justify-center text-2xl">
                {sub.emoji || '🍽️'}
              </div>
              <span className="text-xs font-semibold text-ink w-16 text-center leading-tight">
                {language === 'hi' ? sub.nameHi : sub.name}
              </span>
            </button>
          ))}
        </div>

        {/* Coupon promo banner — real active coupon from admin */}
        {featuredCoupon && (
          <div className="relative bg-gradient-to-r from-accent/20 to-primary/10 rounded-2xl p-5 mb-4 overflow-hidden">
            <span className="absolute -bottom-4 -right-4 text-7xl opacity-20">🍝</span>
            <p className="font-display font-800 text-xl text-primary relative z-10">{featuredCoupon.label}</p>
            <p className="text-xs text-ink/60 mt-0.5 relative z-10">
              {t('इस कूपन से बचत करें', 'Use this coupon to save')}
            </p>
            <button
              onClick={handleCopyCoupon}
              className="flex items-center gap-2 bg-white border-2 border-dashed border-primary text-primary font-bold text-sm px-3 py-1.5 rounded-lg mt-3 relative z-10 active:scale-95 transition"
            >
              {featuredCoupon.code}
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>
        )}

        {/* Footer links — accessible even before login */}
        <div className="flex items-center justify-center gap-4 mt-4 pb-2">
          <button onClick={() => navigate('/about')} className="text-xs font-medium text-ink/40">
            {t('हमारे बारे में', 'About Us')}
          </button>
          <span className="text-ink/20">•</span>
          <button onClick={() => navigate('/contact')} className="text-xs font-medium text-ink/40">
            {t('संपर्क करें', 'Contact Us')}
          </button>
        </div>
      </div>

      <CartBar />
      <WhatsAppButton />
      <BottomNav />
    </div>
  )
}
