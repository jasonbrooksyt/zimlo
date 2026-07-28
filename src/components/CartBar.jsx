import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useStore } from '../store/useStore'

// Floating action bar above bottom nav — orange bar + white "View Cart" pill
// matching the polished reference design.
export default function CartBar() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const itemCount = useStore((s) => s.cartItemCount())
  const subtotal = useStore((s) => s.cartSubtotal())
  const couponDiscount = useStore((s) => s.couponDiscount())
  const deliveryFee = useStore((s) => s.deliveryFeeAmount())

  if (itemCount === 0) return null

  const hasReferralOff =
    typeof window !== 'undefined' &&
    localStorage.getItem('zimlo_referral_pending') === 'true' &&
    deliveryFee === 0

  return (
    <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 w-full max-w-[480px] px-3 z-30 animate-slide-up">
      <button
        onClick={() => navigate('/cart')}
        className="w-full flex items-center justify-between bg-primary text-white rounded-2xl pl-4 pr-1.5 py-2 shadow-pop active:scale-[0.98] transition"
      >
        <div className="flex items-center gap-2.5">
          <ShoppingBag size={20} strokeWidth={2.2} />
          <div className="text-left">
            <p className="font-bold text-sm leading-tight">
              {itemCount} {language === 'hi' ? 'आइटम' : 'items'} • ₹{subtotal}
            </p>
            {(couponDiscount > 0 || hasReferralOff) && (
              <p className="text-[11px] text-white/85 font-medium leading-tight">
                {couponDiscount > 0
                  ? language === 'hi'
                    ? `अतिरिक्त ₹${couponDiscount} छूट लागू`
                    : `Extra ₹${couponDiscount} off applied`
                  : language === 'hi'
                  ? 'रेफरल छूट लागू'
                  : 'Referral discount applied'}
              </p>
            )}
          </div>
        </div>
        <span className="bg-white text-primary font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm">
          {language === 'hi' ? 'कार्ट देखें →' : 'View Cart →'}
        </span>
      </button>
    </div>
  )
}
