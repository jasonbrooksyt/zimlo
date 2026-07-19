import { Plus, Minus } from 'lucide-react'
import { useStore } from '../store/useStore'

// Displays ONE menu item with its price. Deliberately never shows any
// restaurant/hotel name — per the brief, Food is dish-first, not outlet-first.
export default function DishCard({ dish }) {
  const language = useStore((s) => s.language)
  const cart = useStore((s) => s.cart)
  const addToCart = useStore((s) => s.addToCart)
  const decrementItem = useStore((s) => s.decrementItem)

  const cartItem = cart.find((item) => item.id === dish.id)
  const qty = cartItem?.qty || 0

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-3">
      <div className="w-16 h-16 shrink-0 rounded-xl bg-cream flex items-center justify-center text-3xl">
        {dish.img}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center shrink-0 ${
              dish.veg ? 'border-green-600' : 'border-red-600'
            }`}
            aria-label={dish.veg ? 'Vegetarian' : 'Non-vegetarian'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dish.veg ? 'bg-green-600' : 'bg-red-600'}`} />
          </span>
          <p className="font-semibold text-ink text-sm truncate">
            {language === 'hi' ? dish.nameHi : dish.name}
          </p>
        </div>
        <p className="text-primary font-bold text-base mt-0.5">₹{dish.price}</p>
      </div>

      {qty === 0 ? (
        <button
          onClick={() => addToCart(dish)}
          className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm shadow-pop active:scale-95 transition shrink-0"
        >
          {language === 'hi' ? 'जोड़ें' : 'ADD'}
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-primary rounded-xl px-1 py-1 shrink-0">
          <button
            onClick={() => decrementItem(dish.id)}
            aria-label="Decrease quantity"
            className="w-7 h-7 flex items-center justify-center text-white active:scale-90 transition"
          >
            <Minus size={16} />
          </button>
          <span className="text-white font-bold text-sm w-4 text-center">{qty}</span>
          <button
            onClick={() => addToCart(dish)}
            aria-label="Increase quantity"
            className="w-7 h-7 flex items-center justify-center text-white active:scale-90 transition"
          >
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
