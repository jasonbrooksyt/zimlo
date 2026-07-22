import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowDownUp, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import CartBar from '../components/CartBar'
import BottomNav from '../components/BottomNav'
import DishCard from '../components/DishCard'
import SearchBar from '../components/SearchBar'
import VegToggle from '../components/VegToggle'
import { FOOD_SUBCATEGORIES } from '../data/menuData'
import { useStore } from '../store/useStore'
import { useDishes } from '../hooks/useDishes'
import { getDishMeta } from '../lib/dishMeta'

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', labelHi: 'प्रासंगिकता' },
  { id: 'price-low', label: 'Price: Low to High', labelHi: 'कीमत: कम से ज़्यादा' },
  { id: 'price-high', label: 'Price: High to Low', labelHi: 'कीमत: ज़्यादा से कम' },
  { id: 'rating', label: 'Rating', labelHi: 'रेटिंग' }
]

export default function DishList() {
  const { subId } = useParams()
  const language = useStore((s) => s.language)
  const sub = FOOD_SUBCATEGORIES.find((s) => s.id === subId)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  const { dishes: allDishes, loading } = useDishes()

  const [query, setQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [showSort, setShowSort] = useState(false)

  const dishes = useMemo(() => {
    let list = allDishes.filter((d) => d.subcategory === subId)

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (d) => d.name.toLowerCase().includes(q) || d.nameHi.includes(query)
      )
    }
    if (vegOnly) list = list.filter((d) => d.veg)

    if (sortBy === 'price-low') list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-high') list = [...list].sort((a, b) => b.price - a.price)
    if (sortBy === 'rating')
      list = [...list].sort((a, b) => getDishMeta(b).rating - getDishMeta(a).rating)

    return list
  }, [allDishes, subId, query, vegOnly, sortBy])

  return (
    <div className="app-shell pb-28">
      <Header back title={sub?.name} titleHi={sub?.nameHi} />

      <div className="px-4 pt-2">
        <div className="mb-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t('डिश खोजें', 'Search dishes')}
          />
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar relative">
          <VegToggle
            checked={vegOnly}
            onChange={setVegOnly}
            label={t('वेज ओनली', 'Veg Only')}
          />
          <button
            onClick={() => setShowSort((v) => !v)}
            className="flex items-center gap-1.5 bg-white rounded-full shadow-card px-3 py-2 shrink-0 text-xs font-semibold text-ink"
          >
            <ArrowDownUp size={13} />
            {t('सॉर्ट करें', 'Sort')}
          </button>

          {showSort && (
            <div className="absolute top-11 left-0 z-20 bg-white rounded-xl shadow-card p-1.5 w-52">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSortBy(opt.id)
                    setShowSort(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                    sortBy === opt.id ? 'bg-primary/10 text-primary' : 'text-ink/70'
                  }`}
                >
                  {language === 'hi' ? opt.labelHi : opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-ink/40 py-16">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{t('लोड हो रहा है...', 'Loading menu...')}</span>
          </div>
        ) : (
          <>
            <p className="text-xs text-ink/40 mb-3">
              {dishes.length} {t('डिश मिलीं', 'dishes found')}
            </p>

            <div className="space-y-3">
              {dishes.length === 0 ? (
                <p className="text-center text-ink/50 py-16 text-sm">
                  {t('कोई डिश नहीं मिली, फिल्टर बदलें', 'No dishes match — try changing filters')}
                </p>
              ) : (
                dishes.map((dish) => <DishCard key={dish.id} dish={dish} />)
              )}
            </div>
          </>
        )}
      </div>

      <CartBar />
      <BottomNav />
    </div>
  )
}
