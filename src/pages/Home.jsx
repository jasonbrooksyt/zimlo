import { useNavigate } from 'react-router-dom'
import { MapPin, Zap, ShieldCheck, Wallet, ChevronRight, Check } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CartBar from '../components/CartBar'
import CategoryCard from '../components/CategoryCard'
import SearchBar from '../components/SearchBar'
import VegToggle from '../components/VegToggle'
import { CATEGORIES, SERVICE_AREAS } from '../data/menuData'
import { useStore } from '../store/useStore'
import { useSubcategories } from '../hooks/useSubcategories'

export default function Home() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const serviceArea = useStore((s) => s.serviceArea)
  const setServiceArea = useStore((s) => s.setServiceArea)
  const vegOnly = useStore((s) => s.vegOnly)
  const toggleVegOnly = useStore((s) => s.toggleVegOnly)
  const { subcategories } = useSubcategories()
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const trustBadges = [
    { icon: Zap, label: t('60 मिनट डिलीवरी', '60-min delivery') },
    { icon: Wallet, label: t('सबसे कम कीमत', 'Best local prices') },
    { icon: ShieldCheck, label: t('भरोसेमंद सेवा', 'Trusted service') }
  ]

  return (
    <div className="app-shell pb-28">
      <Header />

      <div className="px-4 pt-1 pb-4">
        {/* Service area — all areas shown together, no dropdown */}
        <div className="flex items-center gap-1.5 text-sm text-ink/70 font-medium mb-2">
          <MapPin size={16} className="text-primary shrink-0" />
          <span>{t('डिलीवरी एरिया:', 'Delivery area:')}</span>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {SERVICE_AREAS.map((area) => {
            const isActive = serviceArea === area.id
            return (
              <button
                key={area.id}
                onClick={() => setServiceArea(area.id)}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-semibold shrink-0 transition ${
                  isActive
                    ? 'bg-primary text-white shadow-pop'
                    : 'bg-white text-ink/60 shadow-card'
                }`}
              >
                {isActive && <Check size={13} />}
                {language === 'hi' ? area.nameHi : area.name}
              </button>
            )
          })}
        </div>

        {/* Search bar — tapping takes you into Food to search properly */}
        <div onClick={() => navigate('/food')} className="mb-3 cursor-pointer">
          <SearchBar
            value=""
            onChange={() => {}}
            placeholder={t('खाना या आइटम खोजें', 'Search for food or item')}
          />
        </div>

        {/* Global veg/non-veg preference */}
        <div className="mb-4">
          <VegToggle
            checked={vegOnly}
            onChange={toggleVegOnly}
            label={t('सिर्फ वेज दिखाएं', 'Show Veg Only')}
          />
        </div>

        {/* Compact tagline strip */}
        <div className="flex items-center gap-3 bg-ink rounded-2xl px-4 py-3 mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full -translate-y-6 translate-x-6" />
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-base shrink-0 relative z-10">
            🛵
          </div>
          <div className="relative z-10 min-w-0">
            <p className="font-display font-700 text-sm text-white leading-tight truncate">
              {t('जो चाहो, जहां चाहो, ज़िमलो लाएगा', 'Jo Chaho, Jahan Chaho, Zimlo Laayega')}
            </p>
            <p className="text-white/60 text-[11px] mt-0.5">
              {t('आपके घर तक, आपकी ज़रूरत पर', 'At your Home, whenever you need it')}
            </p>
          </div>
        </div>

        {/* Trust badges row */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {trustBadges.map(({ icon: Icon, label }, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-white rounded-full shadow-card px-3 py-2 shrink-0"
            >
              <Icon size={14} className="text-primary" />
              <span className="text-xs font-semibold text-ink whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>

        <h2 className="font-display font-700 text-base text-ink mb-3">
          {t('क्या चाहिए आज?', 'What do you need today?')}
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
          <button
            onClick={() => navigate('/food')}
            className="flex items-center text-primary text-xs font-semibold"
          >
            {t('सब देखें', 'See all')} <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
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
      </div>

      <CartBar />
      <BottomNav />
    </div>
  )
}
