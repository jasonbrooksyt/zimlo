import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Header from '../components/Header'
import CartBar from '../components/CartBar'
import BottomNav from '../components/BottomNav'
import SearchBar from '../components/SearchBar'
import { useStore } from '../store/useStore'
import { useDishes } from '../hooks/useDishes'
import { useSubcategories } from '../hooks/useSubcategories'

// Shown after tapping "Food" on the home screen. Only dish categories —
// never restaurant names — per the brief's core rule for this vertical.
// Categories themselves are admin-editable (see AdminDashboard -> Menu ->
// Categories), fetched live via useSubcategories.
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
    <div className="app-shell pb-28">
      <Header back title="Food" titleHi="खाना" />

      <div className="px-4 pt-2">
        <div className="mb-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t('कैटेगरी खोजें', 'Search categories')}
          />
        </div>

        <p className="text-sm text-ink/60 mb-4">
          {t('कैटेगरी चुनें और डिश देखें', 'Pick a category to see dishes and prices')}
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
              return (
                <button
                  key={sub.id}
                  onClick={() => navigate(`/food/${sub.id}`)}
                  className="relative flex flex-col items-start gap-2 bg-white rounded-2xl shadow-card p-4 active:scale-[0.97] transition overflow-hidden text-left"
                >
                  <div
                    className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-15"
                    style={{ backgroundColor: color }}
                  />
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative z-10"
                    style={{ backgroundColor: `${color}1F` }}
                  >
                    {sub.emoji || '🍽️'}
                  </div>
                  <div className="relative z-10">
                    <p className="font-display font-700 text-sm text-ink leading-tight">
                      {language === 'hi' ? sub.nameHi : sub.name}
                    </p>
                    <p className="text-xs text-ink/50 mt-0.5">
                      {count} {t('डिश', 'dishes')}
                    </p>
                  </div>
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
      <BottomNav />
    </div>
  )
}
