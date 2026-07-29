import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Star, Plus, Minus, ShoppingBag, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getDishMeta } from '../lib/dishMeta'

export default function DishDetailModal({ dish, onClose }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const cart = useStore((s) => s.cart)
  const cartItemCount = useStore((s) => s.cartItemCount())
  const addToCart = useStore((s) => s.addToCart)
  const decrementItem = useStore((s) => s.decrementItem)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  const [descOpen, setDescOpen] = useState(false)

  if (!dish) return null

  const meta = getDishMeta(dish)
  const cartItem = cart.find((item) => item.id === dish.id)
  const qty = cartItem?.qty || 0
  const hasRatings = dish.ratingCount > 0
  const description = dish.description || ''
  const isLongDesc = description.length > 120

  return (
    <div
      className="fixed inset-0 bg-black/55 z-50 flex items-end justify-center backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] bg-white rounded-t-[28px] overflow-hidden animate-slide-up max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Hero image */}
        <div className="relative w-full h-56 shrink-0 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2]">
          {dish.imageUrl ? (
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              {dish.img}
            </div>
          )}
          {/* Gradient fade into content */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center active:scale-95 transition"
          >
            <X size={18} className="text-ink" />
          </button>

          {/* Veg / non-veg badge on image */}
          <span
            className={`absolute top-3 left-3 w-6 h-6 rounded-md bg-white shadow flex items-center justify-center border-2 ${
              dish.veg ? 'border-green-600' : 'border-red-600'
            }`}
            aria-label={dish.veg ? 'Vegetarian' : 'Non-vegetarian'}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                dish.veg ? 'bg-green-600' : 'bg-red-600'
              }`}
            />
          </span>
        </div>

        {/* Body */}
        <div className="px-5 pt-1 pb-3 overflow-y-auto flex-1">
          <h2 className="font-display font-800 text-xl text-ink leading-snug">
            {language === 'hi' ? dish.nameHi : dish.name}
          </h2>

          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 mb-3">
            {hasRatings ? (
              <span className="flex items-center gap-1 bg-green-700 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                <Star size={10} fill="white" /> {dish.avgRating.toFixed(1)}
                <span className="font-medium opacity-80">
                  ({dish.ratingCount})
                </span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-ink/40 bg-black/[0.04] px-2 py-0.5 rounded">
                {t('नई डिश', 'New')}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-ink/50 font-medium">
              <Clock size={12} className="text-ink/35" />
              {meta.prepMinutes} {t('मिनट', 'min')}
            </span>
            {meta.isBestseller && (
              <span className="text-[10px] font-bold bg-accent/30 text-ink px-2 py-0.5 rounded">
                {t('बेस्टसेलर', 'Bestseller')}
              </span>
            )}
          </div>

          {description ? (
            <div className="mb-4">
              <p
                className={`text-sm text-ink/65 leading-relaxed ${
                  !descOpen && isLongDesc ? 'line-clamp-3' : ''
                }`}
              >
                {description}
              </p>
              {isLongDesc && (
                <button
                  type="button"
                  onClick={() => setDescOpen((v) => !v)}
                  className="flex items-center gap-0.5 text-primary text-xs font-bold mt-1.5"
                >
                  {descOpen ? (
                    <>
                      {t('कम दिखाएं', 'Show less')} <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      {t('और पढ़ें', 'Read more')} <ChevronDown size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          ) : null}

          <div className="flex items-baseline justify-between">
            <p className="font-display font-800 text-2xl text-ink">₹{dish.price}</p>
            {qty > 0 && (
              <p className="text-xs text-ink/45 font-medium">
                {t(`${qty} कार्ट में`, `${qty} in cart`)} · ₹{dish.price * qty}
              </p>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-black/[0.06] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0 space-y-2 bg-white">
          {qty === 0 ? (
            <button
              onClick={() => addToCart(dish)}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition text-[15px]"
            >
              {t('कार्ट में जोड़ें', 'Add to Cart')} · ₹{dish.price}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-between bg-primary rounded-2xl px-2 py-1.5 min-w-[120px]">
                <button
                  onClick={() => decrementItem(dish.id)}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition"
                >
                  <Minus size={18} />
                </button>
                <span className="text-white font-bold text-lg w-6 text-center">{qty}</span>
                <button
                  onClick={() => addToCart(dish)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
              <button
                onClick={() => {
                  onClose()
                  navigate('/cart')
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition"
              >
                <ShoppingBag size={16} />
                {t('कार्ट देखें', 'View Cart')} · ₹{dish.price * qty}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
