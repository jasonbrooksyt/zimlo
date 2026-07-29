import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ChevronRight, Search } from 'lucide-react'
import Header from '../components/Header'
import CartBar from '../components/CartBar'
import BottomNav from '../components/BottomNav'
import WhatsAppButton from '../components/WhatsAppButton'
import { useStore } from '../store/useStore'
import { useDishes } from '../hooks/useDishes'
import { useSubcategories } from '../hooks/useSubcategories'

// Optional 3D icons — same paths as Home craving chips (fallback to emoji)
const SUB_IMAGES = {
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
  desserts: '/icons/crave-desserts.png',
  'non-veg': '/icons/crave-nonveg.png'
}

export default function FoodSubcategories() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  const [query, setQuery] = useState('')
  const { dishes } = useDishes()
  const { subcategories, loading } = useSubcategories()

  const filteredSubs = subcategories.filter((sub) => {
    const name = language === 'hi' ? sub.nameHi : sub.name
    return name.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="app-shell pb-28 bg-[#FAFAFA]">
      <Header back title="Food" titleHi="खाना" />

      <div className="px-4 pt-3">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-white rounded-full px-4 py-3 mb-3 shadow-[0_1px_6px_rgba(0,0,0,0.06)] border border-black/[0.04]">
          <Search size={18} className="text-ink/35 shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('कैटेगरी खोजें', 'Search categories')}
            className="flex-1 outline-none bg-transparent text-sm text-ink placeholder:text-ink/40"
          />
        </div>

        <p className="text-[13px] font-medium text-ink/50 mb-4 px-0.5">
          {t('कैटेगरी चुनें — डिश और कीमत देखें', 'Pick a category to see dishes & prices')}
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-ink/40 py-16">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{t('लोड हो रहा है...', 'Loading...')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredSubs.map((sub) => {
              const count = dishes.filter((d) => d.subcategory === sub.id).length
              const color = sub.color || '#FF9800'
              const img = SUB_IMAGES[sub.id]

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => navigate(`/food/${sub.id}`)}
                  className="relative flex flex-col bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.03] p-3.5 active:scale-[0.97] transition overflow-hidden text-left min-h-[148px]"
                >
                  {/* Soft color wash */}
                  <div
                    className="absolute -top-8 -right-6 w-28 h-28 rounded-full opacity-[0.14]"
                    style={{ backgroundColor: color }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1/2 opacity-[0.06]"
                    style={{
                      background: `linear-gradient(to top, ${color}, transparent)`
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative z-10 shadow-sm"
                    style={{ backgroundColor: `${color}22` }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-12 h-12 object-contain drop-shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fb = e.currentTarget.nextSibling
                          if (fb) fb.style.display = 'block'
                        }}
                      />
                    ) : null}
                    <span
                      className="text-[36px] leading-none"
                      style={{ display: img ? 'none' : 'block' }}
                    >
                      {sub.emoji || '🍽️'}
                    </span>
                  </div>

                  <div className="relative z-10 mt-auto pr-5">
                    <p className="font-display font-800 text-[15px] text-ink leading-tight">
                      {language === 'hi' ? sub.nameHi : sub.name}
                    </p>
                    <p className="text-[12px] text-ink/45 font-medium mt-1">
                      {count} {t('डिश', count === 1 ? 'dish' : 'dishes')}
                    </p>
                  </div>

                  <span className="absolute bottom-3.5 right-3 text-ink/20 z-10">
                    <ChevronRight size={18} />
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {!loading && filteredSubs.length === 0 && (
          <p className="text-center text-ink/40 py-16 text-sm">
            {t('कोई कैटेगरी नहीं मिली', 'No categories found')}
          </p>
        )}
      </div>

      <CartBar />
      <WhatsAppButton />
      <BottomNav />
    </div>
  )
}
