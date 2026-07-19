import { useNavigate } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import Header from '../components/Header'
import CartBar from '../components/CartBar'
import BottomNav from '../components/BottomNav'
import { FOOD_SUBCATEGORIES, DISHES } from '../data/menuData'
import { useStore } from '../store/useStore'

// Shown after tapping "Food" on the home screen. Only dish categories —
// never restaurant names — per the brief's core rule for this vertical.
export default function FoodSubcategories() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  return (
    <div className="app-shell pb-28">
      <Header back title="Food" titleHi="खाना" />

      <div className="px-4 pt-2">
        <p className="text-sm text-ink/60 mb-4">
          {t('कैटेगरी चुनें और डिश देखें', 'Pick a category to see dishes and prices')}
        </p>

        <div className="space-y-3">
          {FOOD_SUBCATEGORIES.map((sub) => {
            const count = DISHES.filter((d) => d.subcategory === sub.id).length
            return (
              <button
                key={sub.id}
                onClick={() => navigate(`/food/${sub.id}`)}
                className="w-full flex items-center gap-4 bg-white rounded-2xl shadow-card p-4 active:scale-[0.98] transition"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <UtensilsCrossed size={22} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-display font-700 text-ink">
                    {language === 'hi' ? sub.nameHi : sub.name}
                  </p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    {count} {t('डिश उपलब्ध', 'dishes available')}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <CartBar />
      <BottomNav />
    </div>
  )
}
