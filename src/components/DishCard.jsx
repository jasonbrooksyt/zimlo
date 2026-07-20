import { Plus, Minus, Star, Flame } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getDishMeta } from '../lib/dishMeta'

// Displays ONE menu item with its price. Deliberately never shows any
// restaurant/hotel name — per the brief, Food is dish-first, not outlet-first.
// Styled after Zomato/Swiggy dish cards: image block, rating, bestseller tag.
export default function DishCard({ dish }) {
  const language = useStore((s) => s.language)
  const cart = useStore((s) => s.cart)
  const addToCart = useStore((s) => s.addToCart)
  const decrementItem = useStore((s) => s.decrementItem)
  const meta = getDishMeta(dish)

  const cartItem = cart.find((item) => item.id === dish.id)
  const qty = cartItem?.qty || 0

  return (
    <div className="flex gap-3 bg-white rounded-2xl shadow-card p-3">
      {/* Image block with badges */}
      <div className="relative w-24 h-24 shrink-0">
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-cream to-primary/10 flex items-center justify-center text-4xl">
          {dish.img}
        </div>
        {meta.isBestseller && (
          <span className="absolute -top-1.5 -left-1.5 bg-accent text-ink text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow flex items-center gap-0.5">
            <Flame size={9} /> {language === 'hi' ? 'बेस्टसेलर' : 'Bestseller'}
          </span>
        )}
        {meta.isTrending && (
          <span className="absolute -top-1.5 -left-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
            🔥 {language === 'hi' ? 'ट्रेंडिंग' : 'Trending'}
          </span>
        )}
        {/* ADD button anchored below image, Swiggy-style */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%]">
          {qty === 0 ? (
            <button
              onClick={() => addToCart(dish)}
              className="w-full py-1.5 rounded-lg bg-white border-2 border-primary text-primary font-bold text-xs shadow-md active:scale-95 transition"
            >
              {language === 'hi' ? 'जोड़ें' : 'ADD'}
            </button>
          ) : (
            <div className="flex items-center justify-between gap-1 bg-primary rounded-lg px-1.5 py-1 shadow-md">
              <button
                onClick={() => decrementItem(dish.id)}
                aria-label="Decrease quantity"
                className="w-5 h-5 flex items-center justify-center text-white active:scale-90 transition"
              >
                <Minus size={13} />
              </button>
              <span className="text-white font-bold text-xs">{qty}</span>
              <button
                onClick={() => addToCart(dish)}
                aria-label="Increase quantity"
                className="w-5 h-5 flex items-center justify-center text-white active:scale-90 transition"
              >
                <Plus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info block */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start gap-1.5">
          <span
            className={`w-3.5 h-3.5 mt-0.5 border-2 rounded-sm flex items-center justify-center shrink-0 ${
              dish.veg ? 'border-green-600' : 'border-red-600'
            }`}
            aria-label={dish.veg ? 'Vegetarian' : 'Non-vegetarian'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dish.veg ? 'bg-green-600' : 'bg-red-600'}`} />
          </span>
          <p className="font-semibold text-ink text-sm leading-snug">
            {language === 'hi' ? dish.nameHi : dish.name}
          </p>
        </div>

        <div className="flex items-center gap-1 mt-1.5">
          <span className="flex items-center gap-0.5 bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            <Star size={9} fill="white" /> {meta.rating}
          </span>
          <span className="text-[11px] text-ink/40">({meta.ratingCount})</span>
          <span className="text-ink/20 text-[11px] mx-1">•</span>
          <span className="text-[11px] text-ink/50">{meta.prepMinutes} {language === 'hi' ? 'मिनट' : 'min'}</span>
        </div>

        <p className="text-ink font-bold text-base mt-1.5">₹{dish.price}</p>
      </div>
    </div>
  )
}
