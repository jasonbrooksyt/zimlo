import { Plus, Minus, Star } from 'lucide-react'
import { useStore } from '../store/useStore'

/**
 * Swiggy-style dish row — large photo, small ADD at image bottom-right.
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
      className="flex gap-3 bg-white rounded-[20px] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.03] active:scale-[0.99] transition"
    >
      {/* Left: text + description panel */}
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
            <p className="font-extrabold text-ink text-[15px] leading-snug tracking-[-0.01em]">
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

        {dish.ratingCount > 0 ? (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-0.5 bg-[#267E3E] text-white text-[10px] font-bold px-1.5 py-[2px] rounded">
              <Star size={9} fill="white" strokeWidth={0} />
              {dish.avgRating.toFixed(1)}
            </span>
          </div>
        ) : null}

        {/* Description — enhanced soft panel */}
        {description ? (
          <div className="mt-2.5 rounded-xl bg-gradient-to-br from-[#FFF8F0] to-[#FFF3E6] border border-[#FFE0B2]/60 px-2.5 py-2">
            <p className="text-[11.5px] text-ink/55 leading-relaxed line-clamp-3">
              {description}
            </p>
          </div>
        ) : null}
      </div>

      {/* Right: image + small ADD bottom-right */}
      <div className="relative shrink-0 w-[132px]">
        <div className="w-[132px] h-[132px] rounded-[16px] overflow-hidden bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] border border-black/[0.04] flex items-center justify-center">
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

        {/* ADD — small, bottom-right of image */}
        <div className="absolute bottom-1.5 right-1.5 z-10">
          {qty === 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                addToCart(dish)
              }}
              className="h-8 min-w-[68px] px-2 rounded-lg bg-white border border-[#E0E0E0] text-[#60B246] font-extrabold text-[11px] tracking-wide shadow-[0_2px_8px_rgba(0,0,0,0.12)] active:scale-95 transition flex items-center justify-center gap-0.5"
            >
              {t('जोड़ें', 'ADD')}
              <Plus size={12} strokeWidth={2.6} />
            </button>
          ) : (
            <div className="h-8 min-w-[68px] rounded-lg bg-[#60B246] shadow-[0_2px_8px_rgba(96,178,70,0.4)] flex items-center justify-between px-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  decrementItem(dish.id)
                }}
                className="w-6 h-6 flex items-center justify-center text-white active:scale-90"
                aria-label="Decrease"
              >
                <Minus size={12} strokeWidth={2.6} />
              </button>
              <span className="text-white font-extrabold text-xs min-w-[16px] text-center">
                {qty}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  addToCart(dish)
                }}
                className="w-6 h-6 flex items-center justify-center text-white active:scale-90"
                aria-label="Increase"
              >
                <Plus size={12} strokeWidth={2.6} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
