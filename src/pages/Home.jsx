import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Mic, ChevronRight, Check, Copy } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CartBar from '../components/CartBar'
import CategoryCard from '../components/CategoryCard'
import VegToggle from '../components/VegToggle'
import WhatsAppButton from '../components/WhatsAppButton'
import { CATEGORIES } from '../data/menuData'
import { useStore } from '../store/useStore'
import { useSubcategories } from '../hooks/useSubcategories'
import { useFeaturedCoupon } from '../hooks/useFeaturedCoupon'

const BANNER_SLIDES = [
  { image: '/banner-services.jpg?v=3', link: '/services' },
  { image: '/banner-food.jpg?v=3', link: '/food' },
  { image: '/banner-grocery.jpg?v=3', link: '/request/grocery' },
  { image: '/banner-bakery.jpg?v=3', link: '/food/bakery-items' }
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
  'thali-combos': '/icons/crave-thali.png',
  'street-food': '/icons/crave-street.png',
  desserts: '/icons/crave-desserts.png',
  'desserts-sweets': '/icons/crave-desserts.png',
  'non-veg': '/icons/crave-nonveg.png'
}

export default function Home() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const serviceArea = useStore((s) => s.serviceArea)
  const vegOnly = useStore((s) => s.vegOnly)
  const toggleVegOnly = useStore((s) => s.toggleVegOnly)
  const { subcategories } = useSubcategories()
  const featuredCoupon = useFeaturedCoupon()
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [slide, setSlide] = useState(0)
  const touchStartX = useRef(null)
  const [listening, setListening] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % BANNER_SLIDES.length), 4000)
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

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 40) return
    if (dx < 0) setSlide((s) => (s + 1) % BANNER_SLIDES.length)
    else setSlide((s) => (s - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)
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
        {/* Banner carousel — swipe enabled */}
        <div
          className="relative rounded-2xl overflow-hidden mb-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full" style={{ aspectRatio: '1280 / 500' }}>
            {BANNER_SLIDES.map((s, i) => (
              <button
                key={s.image}
                type="button"
                onClick={() => navigate(s.link)}
                className={`absolute inset-0 block w-full h-full transition-opacity duration-500 ${
                  i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
                aria-hidden={i !== slide}
              >
                <img
                  src={s.image}
                  alt="Zimlo"
                  className="w-full h-full object-cover object-center transition-opacity duration-500"
                  draggable={false}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={i === 0 ? 'high' : 'low'}
                />
              </button>
            ))}
          </div>

          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-20">
            {BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-5 bg-primary' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Search + Veg */}
        <div className="flex items-center gap-2 mb-3">
          <div
            onClick={() => navigate('/food')}
            className="flex-1 flex items-center gap-2 bg-white rounded-full px-3 py-2 cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.05)] border border-black/[0.04]"
          >
            <Search size={15} className="text-ink/35 shrink-0" />
            <span className="flex-1 text-[12px] text-ink/40">
              {t('खाना, किराना, सेवा…', 'Search food, grocery, service…')}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleMicSearch()
              }}
              aria-label="Voice search"
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition ${
                listening ? 'bg-red-500 animate-pulse' : 'bg-primary'
              }`}
            >
              <Mic size={12} className="text-white" />
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-800 text-[15px] text-ink">
            {t('कैटेगरी से ऑर्डर करें', 'Order by Category')}
          </h2>
          <button
            onClick={() => navigate('/food')}
            className="flex items-center text-primary text-xs font-bold"
          >
            {t('सब देखें', 'See all')} <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>

        {/* Craving */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-800 text-[15px] text-ink">
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
                className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition"
              >
                <div className="w-[54px] h-[54px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.07)] border border-black/[0.04] flex items-center justify-center overflow-hidden relative">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-[92%] h-[92%] object-contain absolute inset-[4%] transition-opacity duration-300"
                      loading="lazy"
                      decoding="async"
                      onLoad={(e) => {
                        e.currentTarget.style.opacity = '1'
                        const fb = e.currentTarget.nextSibling
                        if (fb) fb.style.opacity = '0'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      style={{ opacity: 0 }}
                    />
                  ) : null}
                  <span className="text-[26px] leading-none transition-opacity duration-200">
                    {sub.emoji || '🍽️'}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-ink w-[54px] text-center leading-tight">
                  {language === 'hi' ? sub.nameHi : sub.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Coupon */}
        {featuredCoupon && (
          <button
            type="button"
            onClick={handleCopyCoupon}
            className="relative w-full rounded-2xl overflow-hidden mb-4 shadow-[0_6px_20px_rgba(0,0,0,0.08),0_2px_6px_rgba(255,152,0,0.12)] ring-1 ring-black/[0.04] active:scale-[0.99] transition block text-left bg-white"
            aria-label={t('कूपन कॉपी करें', 'Copy coupon')}
          >
            <img
              src="/icons/offer-banner.jpg?v=4"
              alt={featuredCoupon.label}
              className="w-full h-auto object-contain object-center block align-middle"
              style={{ maxHeight: 'none' }}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/icons/offer-pasta.png'
              }}
            />
            {/* Invisible tap target still copies code */}
            {copied && (
              <span className="absolute top-2 right-2 bg-green-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                {t('कॉपी हो गया!', 'Copied!')}
              </span>
            )}
          </button>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-2 pb-2 px-2">
          <button onClick={() => navigate('/about')} className="text-xs font-medium text-ink/35">
            {t('हमारे बारे में', 'About Us')}
          </button>
          <span className="text-ink/15">•</span>
          <button onClick={() => navigate('/contact')} className="text-xs font-medium text-ink/35">
            {t('संपर्क करें', 'Contact Us')}
          </button>
          <span className="text-ink/15">•</span>
          <button onClick={() => navigate('/privacy-policy')} className="text-xs font-medium text-ink/35">
            {t('गोपनीयता', 'Privacy')}
          </button>
          <span className="text-ink/15">•</span>
          <button onClick={() => navigate('/terms')} className="text-xs font-medium text-ink/35">
            {t('नियम', 'Terms')}
          </button>
          <span className="text-ink/15">•</span>
          <button onClick={() => navigate('/refund-policy')} className="text-xs font-medium text-ink/35">
            {t('रिफंड', 'Refund')}
          </button>
        </div>
      </div>

      <CartBar />
      <WhatsAppButton />
      <BottomNav />
    </div>
  )
}
