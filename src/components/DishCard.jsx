import { Plus, Minus, Star } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getDishMeta } from '../lib/dishMeta'

/**
 * Swiggy-style dish row — larger photo, cleaner hierarchy.
 */
export default function DishCard({ dish, onOpenDetail, showCategory }) {
  const language = useStore((s) => s.language)
  const cart = useStore((s) => s.cart)
  const addToCart = useStore((s) => s.addToCart)
  const decrementItem = useStore((s) => s.decrementItem)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const cartItem = cart.find((c) => c.id === dish.id)
  const qty = cartItem?.qty || 0
  const meta = getDishMeta(dish)
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
      className="flex gap-3.5 bg-white rounded-[20px] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.03] active:scale-[0.99] transition"
    >
      {/* Left: text */}
      <div className="flex-1 min-w-0 flex flex-col pr-0.5">
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
            <p className="font-extrabold text-ink text-[15.5px] leading-snug tracking-[-0.01em]">
              {language === 'hi' ? dish.nameHi : dish.name}
            </p>
            {showCategory && dish.subcategory && (
              <p className="text-[10px] text-ink/40 font-semibold mt-0.5 capitalize">
                {dish.subcategory.replace(/-/g, ' ')}
              </p>
            )}
          </div>
        </div>

        <p className="text-[15px] font-extrabold text-ink mt-2.5">₹{dish.price}</p>

        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {dish.ratingCount > 0 ? (
            <span className="inline-flex items-center gap-0.5 bg-[#267E3E] text-white text-[10px] font-bold px-1.5 py-[3px] rounded">
              <Star size={9} fill="white" strokeWidth={0} />
              {dish.avgRating.toFixed(1)}
            </span>
          ) : null}
          <span className="text-[11px] text-ink/40 font-medium">
            {meta.prepMinutes} {t('मिनट', 'mins')}
          </span>
        </div>

        {description ? (
          <p className="text-[12px] text-ink/40 mt-2 leading-relaxed line-clamp-2">
            {description}
          </p>
        ) : null}
      </div>

      {/* Right: larger image + ADD */}
      <div className="relative shrink-0 w-[140px]">
        <div className="w-[140px] h-[140px] rounded-[18px] overflow-hidden bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] border border-black/[0.04] flex items-center justify-center shadow-inner">
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
            className="text-6xl leading-none items-center justify-center w-full h-full"
            style={{ display: photo ? 'none' : 'flex' }}
          >
            {dish.img || '🍽️'}
          </span>
        </div>

        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10">
          {qty === 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                addToCart(dish)
              }}
              className="min-w-[96px] h-10 px-3 rounded-xl bg-white border-[1.5px] border-[#E0E0E0] text-[#60B246] font-extrabold text-[13px] tracking-wide shadow-[0_4px_14px_rgba(0,0,0,0.14)] active:scale-95 transition flex items-center justify-center gap-0.5"
            >
              {t('जोड़ें', 'ADD')}
              <Plus size={15} strokeWidth={2.6} />
            </button>
          ) : (
            <div className="min-w-[96px] h-10 rounded-xl bg-[#60B246] shadow-[0_4px_14px_rgba(96,178,70,0.45)] flex items-center justify-between px-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  decrementItem(dish.id)
                }}
                className="w-8 h-8 flex items-center justify-center text-white active:scale-90"
                aria-label="Decrease"
              >
                <Minus size={15} strokeWidth={2.6} />
              </button>
              <span className="text-white font-extrabold text-[15px] min-w-[22px] text-center">
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
                <Plus size={15} strokeWidth={2.6} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
