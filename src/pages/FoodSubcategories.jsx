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

// White-bg product photos — save these exact names in public/icons/
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
  'thali-combos': '/icons/crave-thali.png',
  'street-food': '/icons/crave-street.png',
  desserts: '/icons/crave-desserts.png',
  'desserts-sweets': '/icons/crave-desserts.png',
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
                  className="relative flex flex-col items-center bg-white rounded-[22px] shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-black/[0.03] pt-4 pb-3.5 px-3 active:scale-[0.97] transition overflow-hidden text-center min-h-[168px]"
                >
                  {/* Soft brand tint in corner */}
                  <div
                    className="absolute -top-10 -right-8 w-32 h-32 rounded-full opacity-[0.12]"
                    style={{ backgroundColor: color }}
                  />

                  {/* Large white photo well — white-bg images blend in */}
                  <div className="w-[100px] h-[100px] rounded-full bg-white relative z-10 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-black/[0.05] flex items-center justify-center shrink-0">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-[92%] h-[92%] object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fb = e.currentTarget.nextSibling
                          if (fb) fb.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <span
                      className="text-[42px] leading-none items-center justify-center w-full h-full"
                      style={{ display: img ? 'none' : 'flex' }}
                    >
                      {sub.emoji || '🍽️'}
                    </span>
                  </div>

                  <div className="relative z-10 mt-3 w-full px-1">
                    <p className="font-display font-800 text-[14px] text-ink leading-tight">
                      {language === 'hi' ? sub.nameHi : sub.name}
                    </p>
                    <p className="text-[11px] text-ink/45 font-medium mt-0.5">
                      {count} {t('डिश', count === 1 ? 'dish' : 'dishes')}
                    </p>
                  </div>

                  <span className="absolute bottom-3 right-3 text-ink/15 z-10">
                    <ChevronRight size={16} />
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
