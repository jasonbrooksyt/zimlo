import { useMemo, useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ArrowDownUp, Loader2, SlidersHorizontal } from 'lucide-react'
import Header from '../components/Header'
import CartBar from '../components/CartBar'
import BottomNav from '../components/BottomNav'
import DishCard from '../components/DishCard'
import DishDetailModal from '../components/DishDetailModal'
import SearchBar from '../components/SearchBar'
import VegToggle from '../components/VegToggle'
import WhatsAppButton from '../components/WhatsAppButton'
import { useStore } from '../store/useStore'
import { useDishes } from '../hooks/useDishes'
import { useSubcategories } from '../hooks/useSubcategories'
import { filterAndSortDishes, normalizeQuery } from '../lib/searchDishes'

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', labelHi: 'प्रासंगिकता' },
  { id: 'price-low', label: 'Price: Low to High', labelHi: 'कीमत: कम → ज़्यादा' },
  { id: 'price-high', label: 'Price: High to Low', labelHi: 'कीमत: ज़्यादा → कम' },
  { id: 'rating', label: 'Rating', labelHi: 'रेटिंग' }
]

export default function DishList() {
  const { subId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const language = useStore((s) => s.language)
  const globalVegOnly = useStore((s) => s.vegOnly)
  const { subcategories } = useSubcategories()
  const sub = subcategories.find((s) => s.id === subId)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  const { dishes: allDishes, loading } = useDishes()

  const initialQ = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQ)
  const [vegOnly, setVegOnly] = useState(globalVegOnly)
  const [sortBy, setSortBy] = useState('relevance')
  const [showSort, setShowSort] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)

  // Keep URL in sync for shareable search
  useEffect(() => {
    const q = normalizeQuery(query)
    if (q) setSearchParams({ q }, { replace: true })
    else setSearchParams({}, { replace: true })
  }, [query, setSearchParams])

  const isSearching = normalizeQuery(query).length >= 1
  const isAll = subId === 'all' || isSearching

  // When user types a search OR opens /food/all, look across ALL categories
  const dishes = useMemo(() => {
    return filterAndSortDishes(allDishes, {
      query,
      vegOnly,
      sortBy,
      subcategoryId: isAll ? 'all' : subId
    })
  }, [allDishes, subId, query, vegOnly, sortBy, isAll])

  const title = isSearching
    ? t('खोज परिणाम', 'Search results')
    : subId === 'all'
    ? t('सभी डिशेज़', 'All dishes')
    : sub?.name || t('मेन्यू', 'Menu')
  const titleHi = isSearching
    ? 'खोज परिणाम'
    : subId === 'all'
    ? 'सभी डिशेज़'
    : sub?.nameHi

  return (
    <div className="app-shell pb-32 bg-[#F7F7F7] min-h-screen">
      <Header back title={title} titleHi={titleHi} />

      {/* Sticky search + filters */}
      <div className="sticky top-0 z-20 bg-white px-4 pt-2 pb-3 border-b border-black/[0.05]">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={t('डिश, कैटेगरी खोजें…', 'Search dishes, category…')}
          autoFocus={!!initialQ}
        />

        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar relative">
          <VegToggle
            checked={vegOnly}
            onChange={setVegOnly}
            label={t('शुद्ध शाकाहारी', 'Veg Only')}
          />
          <button
            type="button"
            onClick={() => setShowSort((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 shrink-0 text-xs font-bold border transition ${
              sortBy !== 'relevance'
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-white border-black/10 text-ink shadow-sm'
            }`}
          >
            <SlidersHorizontal size={13} />
            {t('सॉर्ट', 'Sort')}
          </button>

          {isSearching && (
            <span className="text-[11px] font-semibold text-ink/50 px-2 shrink-0">
              {t('सभी कैटेगरी में', 'Across all categories')}
            </span>
          )}

          {showSort && (
            <div className="absolute top-11 left-0 z-30 bg-white rounded-2xl shadow-lg border border-black/5 p-1.5 w-56">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.id)
                    setShowSort(false)
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    sortBy === opt.id ? 'bg-primary/10 text-primary' : 'text-ink/70'
                  }`}
                >
                  {language === 'hi' ? opt.labelHi : opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-3.5 pt-3.5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-ink/40 py-20">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{t('मेन्यू लोड हो रहा है…', 'Loading menu…')}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <p className="text-xs font-semibold text-ink/45">
                {dishes.length}{' '}
                {t(
                  dishes.length === 1 ? 'आइटम' : 'आइटम',
                  dishes.length === 1 ? 'item' : 'items'
                )}
                {isSearching ? t(' मिले', ' found') : ''}
              </p>
            </div>

            {dishes.length === 0 ? (
              <div className="text-center py-20 px-6">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-bold text-ink text-base mb-1">
                  {t('कोई डिश नहीं मिली', 'No dishes found')}
                </p>
                <p className="text-sm text-ink/45">
                  {t(
                    'दूसरा नाम आज़माएँ या फिल्टर हटाएँ',
                    'Try another name or clear filters'
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 pb-6">
                {dishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onOpenDetail={setSelectedDish}
                    showCategory={isSearching}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedDish && (
        <DishDetailModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
      )}

      <CartBar />
      <WhatsAppButton />
      <BottomNav />
    </div>
  )
}
