import { Plus, Minus, Star } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getDishMeta } from '../lib/dishMeta'

/**
 * Swiggy-style dish row: info left, large photo + ADD on the right.
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
  const description = dish.description || ''
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
      className="flex gap-3 bg-white rounded-2xl p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.04] active:scale-[0.99] transition"
    >
      {/* Left: text */}
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
              <p className="text-[10px] text-ink/40 font-medium mt-0.5 capitalize">
                {dish.subcategory.replace(/-/g, ' ')}
              </p>
            )}
          </div>
        </div>

        <p className="text-[13px] font-bold text-ink mt-2">₹{dish.price}</p>

        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {dish.ratingCount > 0 ? (
            <span className="inline-flex items-center gap-0.5 bg-[#267E3E] text-white text-[10px] font-bold px-1.5 py-[3px] rounded">
              <Star size={9} fill="white" strokeWidth={0} />
              {dish.avgRating.toFixed(1)}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-ink/40 bg-black/[0.04] px-1.5 py-[3px] rounded">
              {t('नई', 'New')}
            </span>
          )}
          <span className="text-[11px] text-ink/45">
            · {meta.prepMinutes} {t('मिनट', 'mins')}
          </span>
        </div>

        {description && (
          <p className="text-[12px] text-ink/45 mt-2 leading-snug line-clamp-2">{description}</p>
        )}
      </div>

      {/* Right: image + ADD */}
      <div className="relative shrink-0 w-[118px]">
        <div className="w-[118px] h-[118px] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border border-black/[0.04] flex items-center justify-center">
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

        {/* ADD / qty — Swiggy style floating on image bottom */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
          {qty === 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                addToCart(dish)
              }}
              className="min-w-[88px] h-9 px-3 rounded-xl bg-white border-[1.5px] border-[#E8E8E8] text-[#60B246] font-extrabold text-[13px] tracking-wide shadow-[0_2px_8px_rgba(0,0,0,0.12)] active:scale-95 transition flex items-center justify-center gap-0.5"
            >
              {t('जोड़ें', 'ADD')}
              <Plus size={14} strokeWidth={2.5} />
            </button>
          ) : (
            <div className="min-w-[88px] h-9 rounded-xl bg-[#60B246] shadow-[0_2px_8px_rgba(96,178,70,0.4)] flex items-center justify-between px-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  decrementItem(dish.id)
                }}
                className="w-7 h-7 flex items-center justify-center text-white active:scale-90"
                aria-label="Decrease"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span className="text-white font-extrabold text-sm min-w-[20px] text-center">{qty}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  addToCart(dish)
                }}
                className="w-7 h-7 flex items-center justify-center text-white active:scale-90"
                aria-label="Increase"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
