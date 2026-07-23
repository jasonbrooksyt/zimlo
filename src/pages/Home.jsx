import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Zap, ShieldCheck, Wallet, ChevronRight, X, Check } from 'lucide-react'
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

  const [showAreaPicker, setShowAreaPicker] = useState(false)
  const currentArea = SERVICE_AREAS.find((a) => a.id === serviceArea) || SERVICE_AREAS[0]

  const trustBadges = [
    { icon: Zap, label: t('30 मिनट डिलीवरी', '30-min delivery') },
    { icon: Wallet, label: t('सबसे कम कीमत', 'Best local prices') },
    { icon: ShieldCheck, label: t('भरोसेमंद सेवा', 'Trusted service') }
  ]

  return (
    <div className="app-shell pb-28">
      <Header />

      <div className="px-4 pt-1 pb-4">
        {/* Service area picker — Zimlo only delivers in these towns */}
        <button
          onClick={() => setShowAreaPicker(true)}
          className="flex items-center gap-1.5 text-sm text-ink/70 font-medium mb-3"
        >
          <MapPin size={16} className="text-primary" />
          {t('डिलीवर करें:', 'Deliver to:')} {language === 'hi' ? currentArea.nameHi : currentArea.name}
          <span className="text-primary font-semibold underline">{t('बदलें', 'change')}</span>
        </button>

        {/* Search bar — tapping takes you into Food to search properly */}
        <div onClick={() => navigate('/food')} className="mb-3 cursor-pointer">
          <SearchBar
            value=""
            onChange={() => {}}
            placeholder={t('खाना, दुकान या आइटम खोजें', 'Search for food, shop or item')}
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

        {/* Hero / tagline banner */}
        <div className="bg-gradient-to-br from-primary to-accent rounded-blob p-5 mb-4 shadow-pop relative overflow-hidden">
          <div className="absolute -bottom-6 -right-4 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -top-8 -left-4 w-20 h-20 rounded-full bg-white/10" />
          <p className="font-display font-800 text-2xl text-white leading-tight relative z-10">
            {t('जो चाहो, जहां चाहो,', 'Jo Chaho, Jahan Chaho,')}
            <br />
            {t('ज़िमलो लाएगा', 'Zimlo Laayega')}
          </p>
          <p className="text-white/90 text-sm mt-1.5 font-medium relative z-10">
            {t('आपके शहर में, आपकी ज़रूरत पर', 'In your town, whenever you need it')}
          </p>
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

      {/* Service area picker modal */}
      {showAreaPicker && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={() => setShowAreaPicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] bg-white rounded-t-3xl p-5 pb-8 animate-slide-up"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-700 text-lg text-ink">
                {t('डिलीवरी एरिया चुनें', 'Choose delivery area')}
              </h3>
              <button onClick={() => setShowAreaPicker(false)} className="text-ink/40">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {SERVICE_AREAS.map((area) => (
                <button
                  key={area.id}
                  onClick={() => {
                    setServiceArea(area.id)
                    setShowAreaPicker(false)
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition ${
                    serviceArea === area.id ? 'border-primary bg-primary/10' : 'border-black/10'
                  }`}
                >
                  <span className="font-semibold text-sm text-ink">
                    {language === 'hi' ? area.nameHi : area.name}
                  </span>
                  {serviceArea === area.id && <Check size={18} className="text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <CartBar />
      <BottomNav />
    </div>
  )
}
