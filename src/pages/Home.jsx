import { useNavigate } from 'react-router-dom'
import { MapPin, Zap, ShieldCheck, Wallet, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CartBar from '../components/CartBar'
import CategoryCard from '../components/CategoryCard'
import SearchBar from '../components/SearchBar'
import { CATEGORIES, FOOD_SUBCATEGORIES } from '../data/menuData'
import { useStore } from '../store/useStore'

const CUISINE_EMOJI = {
  'fast-food': '🍔',
  'north-indian': '🍛',
  'south-indian': '🥞',
  chinese: '🍜',
  'bakery-items': '🍰',
  beverages: '🥤',
  pizza: '🍕',
  'rolls-wraps': '🌯',
  thali: '🍱',
  'street-food': '🥟',
  desserts: '🍨'
}

export default function Home() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const trustBadges = [
    { icon: Zap, label: t('30 मिनट डिलीवरी', '30-min delivery') },
    { icon: Wallet, label: t('सबसे कम कीमत', 'Best local prices') },
    { icon: ShieldCheck, label: t('भरोसेमंद सेवा', 'Trusted service') }
  ]

  return (
    <div className="app-shell pb-28">
      <Header />

      <div className="px-4 pt-1 pb-4">
        {/* Location bar — static/dummy for now */}
        <button className="flex items-center gap-1.5 text-sm text-ink/70 font-medium mb-3">
          <MapPin size={16} className="text-primary" />
          {t('डिलीवर करें: सतना, म.प्र.', 'Deliver to: Satna, M.P.')}
          <span className="text-primary font-semibold underline">{t('बदलें', 'change')}</span>
        </button>

        {/* Search bar — tapping takes you into Food to search properly */}
        <div onClick={() => navigate('/food')} className="mb-4 cursor-pointer">
          <SearchBar
            value=""
            onChange={() => {}}
            placeholder={t('खाना, दुकान या आइटम खोजें', 'Search for food, shop or item')}
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
          {FOOD_SUBCATEGORIES.map((sub) => (
            <button
              key={sub.id}
              onClick={() => navigate(`/food/${sub.id}`)}
              className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-card flex items-center justify-center text-2xl">
                {CUISINE_EMOJI[sub.id] || '🍽️'}
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
