import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Mic, ChevronRight, Check, Copy, MapPin } from 'lucide-react'
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

const BANNER_SLIDES = [
  { image: '/banner-hero.jpg', link: '/food' },
  { image: '/banner-food.jpg', link: '/food' },
  { image: '/banner-grocery.jpg', link: '/request/grocery' },
  { image: '/banner-services.jpg', link: '/services' }
]

// Optional 3D icons for cuisine chips — fall back to emoji.
const CRAVING_IMAGES = {
  'fast-food': '/icons/crave-fastfood.png',
  'north-indian': '/icons/crave-north.png',
  'south-indian': '/icons/crave-south.png',
  chinese: '/icons/crave-chinese.png',
  'bakery-items': '/icons/crave-bakery.png',
  beverages: '/icons/crave-beverages.png',
  pizza: '/icons/crave-pizza.png',
  'rolls-wraps': '/icons/crave-rolls.png',
  thali: '/icons/crave-thali.png',
  'street-food': '/icons/crave-street.png',
  desserts: '/icons/crave-desserts.png'
}

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
    <div className="app-shell pb-28 bg-[#FAFAFA]">
      <Header />

      <div className="px-4 pt-3 pb-4">
        {/* Area chips */}
        <div id="area-chips" className="flex gap-2 mb-3.5 overflow-x-auto no-scrollbar">
          {SERVICE_AREAS.map((area) => {
            const isActive = serviceArea === area.id
            return (
              <button
                key={area.id}
                onClick={() => setServiceArea(area.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold shrink-0 transition ${
                  isActive
                    ? 'bg-primary text-white shadow-pop'
                    : 'bg-white text-ink/55 shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                }`}
              >
                {isActive && <MapPin size={13} className="shrink-0" />}
                {language === 'hi' ? area.nameHi : area.name}
              </button>
            )
          })}
        </div>

        {/* Banner carousel */}
        <div className="relative rounded-2xl overflow-hidden mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-ink">
          <div className="relative w-full" style={{ aspectRatio: '1280 / 447' }}>
            {BANNER_SLIDES.map((s, i) => (
              <button
                key={s.image}
                onClick={() => navigate(s.link)}
                className={`absolute inset-0 block w-full h-full transition-opacity duration-500 ${
                  i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
                aria-hidden={i !== slide}
              >
                <img
                  src={s.image}
                  alt="Zimlo"
                  className="w-full h-full object-cover object-center"
                  draggable={false}
                />
              </button>
            ))}
          </div>
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-20">
            {BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-5 bg-primary' : 'w-1.5 bg-white/45'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Search + Veg */}
        <div className="flex items-center gap-2 mb-5">
          <div
            onClick={() => navigate('/food')}
            className="flex-1 flex items-center gap-2.5 bg-white rounded-full px-4 py-3 cursor-pointer shadow-[0_1px_6px_rgba(0,0,0,0.06)] border border-black/[0.04]"
          >
            <Search size={18} className="text-ink/35 shrink-0" />
            <span className="flex-1 text-sm text-ink/40">
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
            <VegToggle
              checked={vegOnly}
              onChange={toggleVegOnly}
              label={t('केवल वेज', 'Veg Only')}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-800 text-[17px] text-ink">
            {t('कैटेगरी से ऑर्डर करें', 'Order by Category')}
          </h2>
          <button
            onClick={() => navigate('/food')}
            className="flex items-center text-primary text-xs font-bold"
          >
            {t('सब देखें', 'See all')} <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-7">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>

        {/* Craving */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-800 text-[17px] text-ink">
            {t('क्या खाना है?', 'What are you craving?')}
          </h2>
          <button
            onClick={() => navigate('/food')}
            className="flex items-center text-primary text-xs font-bold"
          >
            {t('सब देखें', 'See all')} <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-1 mb-6">
          {subcategories.map((sub) => {
            const img = CRAVING_IMAGES[sub.id]
            return (
              <button
                key={sub.id}
                onClick={() => navigate(`/food/${sub.id}`)}
                className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition"
              >
                <div className="w-[72px] h-[72px] rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-black/[0.04] flex items-center justify-center overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-[85%] h-[85%] object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fb = e.currentTarget.nextSibling
                        if (fb) fb.style.display = 'block'
                      }}
                    />
                  ) : null}
                  <span
                    className="text-[32px] leading-none"
                    style={{ display: img ? 'none' : 'block' }}
                  >
                    {sub.emoji || '🍽️'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-ink w-[72px] text-center leading-tight">
                  {language === 'hi' ? sub.nameHi : sub.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Coupon */}
        {featuredCoupon && (
          <div className="relative rounded-2xl overflow-hidden mb-4 bg-gradient-to-r from-[#FFF3E0] via-[#FFE8C7] to-[#FFD59A] shadow-[0_2px_12px_rgba(255,152,0,0.15)]">
            <div className="flex items-center">
              <div className="flex-1 p-4 pr-2 relative z-10">
                <p className="font-display font-800 text-xl text-primary leading-tight">
                  {featuredCoupon.label}
                </p>
                <p className="text-xs text-ink/55 mt-0.5 font-medium">
                  {t('अपने पहले ऑर्डर पर', 'On your first order')}
                </p>
                <button
                  onClick={handleCopyCoupon}
                  className="inline-flex items-center gap-1.5 bg-white border border-dashed border-primary/60 text-primary font-bold text-xs px-3 py-1.5 rounded-lg mt-2.5 active:scale-95 transition shadow-sm"
                >
                  {featuredCoupon.code}
                  {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                </button>
              </div>
              <div className="w-[120px] h-[110px] shrink-0 relative">
                <img
                  src="/icons/coupon-pasta.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fb = e.currentTarget.nextSibling
                    if (fb) fb.style.display = 'flex'
                  }}
                />
                <div className="hidden absolute inset-0 items-center justify-center text-6xl">
                  🍝
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 mt-2 pb-2">
          <button onClick={() => navigate('/about')} className="text-xs font-medium text-ink/35">
            {t('हमारे बारे में', 'About Us')}
          </button>
          <span className="text-ink/15">•</span>
          <button onClick={() => navigate('/contact')} className="text-xs font-medium text-ink/35">
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
