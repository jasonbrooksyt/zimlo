import { X, Star, Plus, Minus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getDishMeta } from '../lib/dishMeta'

// Full-detail bottom sheet for a single dish — opened by tapping anywhere
// on a DishCard (except the Add/quantity controls). Shows the real photo
// (or emoji fallback), full description, rating, and lets the customer
// add/adjust quantity from here too.
export default function DishDetailModal({ dish, onClose }) {
  const language = useStore((s) => s.language)
  const cart = useStore((s) => s.cart)
  const addToCart = useStore((s) => s.addToCart)
  const decrementItem = useStore((s) => s.decrementItem)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  if (!dish) return null

  const meta = getDishMeta(dish)
  const cartItem = cart.find((item) => item.id === dish.id)
  const qty = cartItem?.qty || 0

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] bg-white rounded-t-3xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col"
      >
        {/* Photo / emoji hero */}
        <div className="relative w-full h-52 shrink-0 bg-gradient-to-br from-cream to-primary/10 flex items-center justify-center">
          {dish.imageUrl ? (
            <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">{dish.img}</span>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow-card flex items-center justify-center"
          >
            <X size={18} className="text-ink" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <div className="flex items-start gap-2 mb-1">
            <span
              className={`w-4 h-4 mt-1 border-2 rounded-sm flex items-center justify-center shrink-0 ${
                dish.veg ? 'border-green-600' : 'border-red-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dish.veg ? 'bg-green-600' : 'bg-red-600'}`} />
            </span>
            <h2 className="font-display font-700 text-xl text-ink leading-snug">
              {language === 'hi' ? dish.nameHi : dish.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-2 py-1 rounded">
              <Star size={11} fill="white" /> {meta.rating}
            </span>
            <span className="text-xs text-ink/40">({meta.ratingCount} {t('रेटिंग', 'ratings')})</span>
            <span className="text-ink/20 text-xs mx-1">•</span>
            <span className="text-xs text-ink/50">{meta.prepMinutes} {t('मिनट', 'min')}</span>
          </div>

          {dish.description ? (
            <p className="text-sm text-ink/70 leading-relaxed mb-4">{dish.description}</p>
          ) : (
            <p className="text-sm text-ink/40 italic mb-4">
              {t('इस डिश का कोई विवरण उपलब्ध नहीं है', 'No description available for this dish yet')}
            </p>
          )}

          <p className="font-display font-800 text-2xl text-ink">₹{dish.price}</p>
        </div>

        {/* Sticky add-to-cart footer */}
        <div className="border-t border-black/5 p-4 shrink-0">
          {qty === 0 ? (
            <button
              onClick={() => addToCart(dish)}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition"
            >
              {t('कार्ट में जोड़ें', 'Add to Cart')}
            </button>
          ) : (
            <div className="flex items-center justify-between bg-primary rounded-2xl px-4 py-2">
              <button
                onClick={() => decrementItem(dish.id)}
                aria-label="Decrease quantity"
                className="w-9 h-9 flex items-center justify-center text-white active:scale-90 transition"
              >
                <Minus size={18} />
              </button>
              <span className="text-white font-bold text-lg">{qty}</span>
              <button
                onClick={() => addToCart(dish)}
                aria-label="Increase quantity"
                className="w-9 h-9 flex items-center justify-center text-white active:scale-90 transition"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
