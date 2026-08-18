import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Mic, ChevronRight, Check, Copy, Plus, Minus, Star } from 'lucide-react'
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
import { useDishes } from '../hooks/useDishes'

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
  const { coupon: featuredCoupon, loading: couponLoading } = useFeaturedCoupon()
  const { dishes: allDishes } = useDishes()
  const addToCart = useStore((s) => s.addToCart)
  const decrementItem = useStore((s) => s.decrementItem)
  const cart = useStore((s) => s.cart)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  // Zomato-style: shuffled picks that change each visit (session-stable)
  const [picks, setPicks] = useState([])
  const picksScrollRef = useRef(null)
  const picksPausedRef = useRef(false)
  useEffect(() => {
    let pool = allDishes || []
    if (vegOnly) pool = pool.filter((d) => d.veg)
    if (pool.length === 0) {
      setPicks([])
      return
    }
    // Seed shuffle with date+hour so list feels fresh but stable for a bit
    const seed = new Date().toISOString().slice(0, 13)
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
    const arr = [...pool]
    for (let i = arr.length - 1; i > 0; i--) {
      h = (h * 1664525 + 1013904223) >>> 0
      const j = h % (i + 1)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setPicks(arr.slice(0, 12))
  }, [allDishes, vegOnly])

  // Auto-rotate recommended row (pauses while user touches)
  useEffect(() => {
    if (picks.length < 3) return undefined
    const el = picksScrollRef.current
    if (!el) return undefined

    const step = () => {
      if (picksPausedRef.current || !el) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll <= 0) return
      const next = el.scrollLeft + 156 // ~ one card width
      if (next >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollTo({ left: next, behavior: 'smooth' })
      }
    }
    const id = setInterval(step, 3200)
    return () => clearInterval(id)
  }, [picks])

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
      navigate('/food/all')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (ev) => {
      const said = ev.results?.[0]?.[0]?.transcript || ''
      if (said.trim()) navigate(`/food/all?q=${encodeURIComponent(said.trim())}`)
      else navigate('/food/all')
    }
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
            onClick={() => navigate('/food/all')}
            className="flex-1 flex items-center gap-2 bg-white rounded-full px-3.5 py-2.5 cursor-pointer shadow-[0_1px_6px_rgba(0,0,0,0.07)] border border-black/[0.05]"
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
                <div className="w-[54px] h-[54px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.07)] border border-black/[0.04] flex items-center justify-center overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-[92%] h-[92%] object-contain"
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fb = e.currentTarget.nextSibling
                        if (fb) fb.style.display = 'block'
                      }}
                    />
                  ) : null}
                  <span
                    className="text-[26px] leading-none"
                    style={{ display: img ? 'none' : 'block' }}
                  >
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

        {/* Recommended dishes — Zomato-style easy picks */}
        {picks.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display font-800 text-[15px] text-ink">
                  {t('आपके लिए सुझाव', 'Recommended for you')}
                </h2>
                <p className="text-[11px] text-ink/40 font-medium mt-0.5">
                  {t('एक टैप में ऑर्डर करें', 'Order in one tap')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/food/all')}
                className="flex items-center text-primary text-xs font-bold"
              >
                {t('सब देखें', 'See all')} <ChevronRight size={14} />
              </button>
            </div>
            <div
              ref={picksScrollRef}
              onTouchStart={() => { picksPausedRef.current = true }}
              onTouchEnd={() => { setTimeout(() => { picksPausedRef.current = false }, 4000) }}
              onMouseEnter={() => { picksPausedRef.current = true }}
              onMouseLeave={() => { picksPausedRef.current = false }}
              className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 scroll-smooth"
            >
              {picks.map((dish) => {
                const qty = cart.find((c) => c.id === dish.id)?.qty || 0
                const photo = dish.imageUrl || null
                return (
                  <div
                    key={dish.id}
                    className="shrink-0 w-[148px] bg-white rounded-2xl border border-black/[0.04] shadow-[0_2px_10px_rgba(0,0,0,0.06)] overflow-hidden active:scale-[0.98] transition"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/food/${dish.subcategory || 'all'}`)}
                      className="w-full text-left"
                    >
                      <div className="relative w-full h-[112px] bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2]">
                        {photo ? (
                          <img
                            src={photo}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-4xl">
                            {dish.img || '🍽️'}
                          </span>
                        )}
                        <span
                          className={`absolute top-2 left-2 w-3.5 h-3.5 border-[1.5px] rounded-[3px] flex items-center justify-center bg-white/90 ${
                            dish.veg ? 'border-green-600' : 'border-red-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              dish.veg ? 'bg-green-600' : 'bg-red-600'
                            }`}
                          />
                        </span>
                      </div>
                      <div className="px-2.5 pt-2 pb-1">
                        <p className="font-bold text-[12.5px] text-ink leading-snug line-clamp-2 min-h-[32px]">
                          {language === 'hi' ? dish.nameHi : dish.name}
                        </p>
                        <div className="flex items-center justify-between mt-1.5 gap-1">
                          <p className="font-extrabold text-[13px] text-ink">₹{dish.price}</p>
                          {dish.ratingCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 bg-[#267E3E] text-white text-[9px] font-bold px-1 py-[2px] rounded">
                              <Star size={8} fill="white" strokeWidth={0} />
                              {dish.avgRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="px-2.5 pb-2.5">
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => addToCart(dish)}
                          className="w-full h-8 rounded-lg bg-white border border-[#E0E0E0] text-[#60B246] font-extrabold text-[11px] shadow-sm active:scale-95 transition flex items-center justify-center gap-0.5"
                        >
                          {t('जोड़ें', 'ADD')}
                          <Plus size={12} strokeWidth={2.6} />
                        </button>
                      ) : (
                        <div className="w-full h-8 rounded-lg bg-[#60B246] flex items-center justify-between px-1">
                          <button
                            type="button"
                            onClick={() => decrementItem(dish.id)}
                            className="w-7 h-7 flex items-center justify-center text-white"
                          >
                            <Minus size={12} strokeWidth={2.6} />
                          </button>
                          <span className="text-white font-extrabold text-xs">{qty}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(dish)}
                            className="w-7 h-7 flex items-center justify-center text-white"
                          >
                            <Plus size={12} strokeWidth={2.6} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Coupon — fixed aspect box so footer doesn't jump while image loads */}
        {(couponLoading || featuredCoupon) && (
          <div className="mb-4" style={{ aspectRatio: '1280 / 468' }}>
            {featuredCoupon ? (
              <button
                type="button"
                onClick={handleCopyCoupon}
                className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.08),0_2px_6px_rgba(255,152,0,0.12)] ring-1 ring-black/[0.04] active:scale-[0.99] transition block text-left bg-white"
                aria-label={t('कूपन कॉपी करें', 'Copy coupon')}
              >
                <img
                  src="/icons/offer-banner.jpg?v=6"
                  alt={featuredCoupon.label}
                  className="w-full h-full object-contain object-center block"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/icons/offer-pasta.png'
                  }}
                />
                {copied && (
                  <span className="absolute top-2 right-2 bg-green-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                    {t('कॉपी हो गया!', 'Copied!')}
                  </span>
                )}
              </button>
            ) : (
              <div className="w-full h-full rounded-2xl bg-[#FFF3E0] ring-1 ring-black/[0.04] animate-pulse" />
            )}
          </div>
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
