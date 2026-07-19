import { MapPin } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import CartBar from '../components/CartBar'
import CategoryCard from '../components/CategoryCard'
import { CATEGORIES } from '../data/menuData'
import { useStore } from '../store/useStore'

export default function Home() {
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  return (
    <div className="app-shell pb-28">
      <Header />

      <div className="px-4 pt-1 pb-4">
        {/* Location bar — static/dummy for now */}
        <button className="flex items-center gap-1.5 text-sm text-ink/70 font-medium mb-4">
          <MapPin size={16} className="text-primary" />
          {t('डिलीवर करें: सतना, म.प्र.', 'Deliver to: Satna, M.P.')}
          <span className="text-primary font-semibold underline">{t('बदलें', 'change')}</span>
        </button>

        {/* Hero / tagline */}
        <div className="bg-gradient-to-br from-primary to-accent rounded-blob p-5 mb-6 shadow-pop relative overflow-hidden">
          <p className="font-display font-800 text-2xl text-white leading-tight">
            {t('जो चाहो, जहां चाहो,', 'Jo Chaho, Jahan Chaho,')}
            <br />
            {t('ज़िमलो लाएगा', 'Zimlo Laayega')}
          </p>
          <p className="text-white/90 text-sm mt-1.5 font-medium">
            {t('आपके शहर में, आपकी ज़रूरत पर', 'In your town, whenever you need it')}
          </p>
        </div>

        <h2 className="font-display font-700 text-base text-ink mb-3">
          {t('क्या चाहिए आज?', 'What do you need today?')}
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>

      <CartBar />
      <BottomNav />
    </div>
  )
}
