import { Plus, Minus, Star } from 'lucide-react'
import { useStore } from '../store/useStore'

/**
 * Clean dish row — photo right, ADD under photo (not overlapping awkwardly).
 */
export default function DishCard({ dish, onOpenDetail, showCategory }) {
  const language = useStore((s) => s.language)
  const cart = useStore((s) => s.cart)
  const addToCart = useStore((s) => s.addToCart)
  const decrementItem = useStore((s) => s.decrementItem)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const cartItem = cart.find((c) => c.id === dish.id)
  const qty = cartItem?.qty || 0
  const description = (dish.description || '').trim()
  const photo = dish.imageUrl || null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail?.(dish)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenDetail?.(dish)
        }
      }}
      className="flex gap-3 bg-white rounded-2xl p-3 shadow-[0_1px_8px_rgba(0,0,0,0.05)] border border-black/[0.04] active:scale-[0.99] transition"
    >
      {/* Left content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start gap-1.5">
          <span
            className={`w-3.5 h-3.5 mt-1 border-[1.5px] rounded-[3px] flex items-center justify-center shrink-0 ${
              dish.veg ? 'border-green-600' : 'border-red-600'
            }`}
            aria-label={dish.veg ? 'Vegetarian' : 'Non-vegetarian'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${dish.veg ? 'bg-green-600' : 'bg-red-600'}`}
            />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-ink text-[15px] leading-snug">
              {language === 'hi' ? dish.nameHi : dish.name}
            </p>
            {showCategory && dish.subcategory && (
              <p className="text-[10px] text-ink/40 font-semibold mt-0.5 capitalize">
                {dish.subcategory.replace(/-/g, ' ')}
              </p>
            )}
          </div>
        </div>

        <p className="text-[15px] font-extrabold text-ink mt-2">₹{dish.price}</p>

        {dish.ratingCount > 0 && (
          <span className="inline-flex items-center gap-0.5 mt-1.5 w-fit bg-[#267E3E] text-white text-[10px] font-bold px-1.5 py-[2px] rounded">
            <Star size={9} fill="white" strokeWidth={0} />
            {dish.avgRating.toFixed(1)}
          </span>
        )}

        {description ? (
          <p className="text-[12px] text-ink/45 mt-2 leading-relaxed line-clamp-2">
            {description}
          </p>
        ) : null}
      </div>

      {/* Right: image + ADD below image */}
      <div className="shrink-0 w-[120px] flex flex-col items-center gap-2">
        <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden bg-[#F5F5F5] border border-black/[0.04] flex items-center justify-center">
          {photo ? (
            <img
              src={photo}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fb = e.currentTarget.nextSibling
                if (fb) fb.style.display = 'flex'
              }}
            />
          ) : null}
          <span
            className="text-5xl leading-none items-center justify-center w-full h-full"
            style={{ display: photo ? 'none' : 'flex' }}
          >
            {dish.img || '🍽️'}
          </span>
        </div>

        {qty === 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              addToCart(dish)
            }}
            className="w-full h-9 rounded-xl bg-white border-[1.5px] border-[#60B246] text-[#60B246] font-extrabold text-[13px] tracking-wide shadow-sm active:scale-95 transition flex items-center justify-center gap-0.5"
          >
            {t('जोड़ें', 'ADD')}
            <Plus size={14} strokeWidth={2.5} />
          </button>
        ) : (
          <div className="w-full h-9 rounded-xl bg-[#60B246] flex items-center justify-between px-1 shadow-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                decrementItem(dish.id)
              }}
              className="w-8 h-8 flex items-center justify-center text-white active:scale-90"
              aria-label="Decrease"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="text-white font-extrabold text-sm min-w-[18px] text-center">
              {qty}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                addToCart(dish)
              }}
              className="w-8 h-8 flex items-center justify-center text-white active:scale-90"
              aria-label="Increase"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
