import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import CartBar from '../components/CartBar'
import BottomNav from '../components/BottomNav'
import DishCard from '../components/DishCard'
import { DISHES, FOOD_SUBCATEGORIES } from '../data/menuData'
import { useStore } from '../store/useStore'

export default function DishList() {
  const { subId } = useParams()
  const language = useStore((s) => s.language)
  const sub = FOOD_SUBCATEGORIES.find((s) => s.id === subId)
  const dishes = DISHES.filter((d) => d.subcategory === subId)

  return (
    <div className="app-shell pb-28">
      <Header back title={sub?.name} titleHi={sub?.nameHi} />

      <div className="px-4 pt-2 space-y-3">
        {dishes.length === 0 ? (
          <p className="text-center text-ink/50 py-10">
            {language === 'hi' ? 'फिलहाल कोई डिश उपलब्ध नहीं है' : 'No dishes available right now'}
          </p>
        ) : (
          dishes.map((dish) => <DishCard key={dish.id} dish={dish} />)
        )}
      </div>

      <CartBar />
      <BottomNav />
    </div>
  )
}
