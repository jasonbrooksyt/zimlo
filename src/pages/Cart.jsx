import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShoppingBag, Tag, X, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useStore } from '../store/useStore'
import { DELIVERY_FEE } from '../data/menuData'

export default function Cart() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const cart = useStore((s) => s.cart)
  const addToCart = useStore((s) => s.addToCart)
  const decrementItem = useStore((s) => s.decrementItem)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const subtotal = useStore((s) => s.cartSubtotal())
  const appliedCoupon = useStore((s) => s.appliedCoupon)
  const discount = useStore((s) => s.couponDiscount())
  const applyCoupon = useStore((s) => s.applyCoupon)
  const removeCoupon = useStore((s) => s.removeCoupon)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [couponInput, setCouponInput] = useState('')
  const [couponMsg, setCouponMsg] = useState(null) // { success, message }
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplyingCoupon(true)
    const result = await applyCoupon(couponInput)
    setApplyingCoupon(false)
    setCouponMsg(result)
    if (result.success) setCouponInput('')
  }

  if (cart.length === 0) {
    return (
      <div className="app-shell pb-28">
        <Header back title="Cart" titleHi="कार्ट" />
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <ShoppingBag size={56} className="text-ink/20 mb-4" />
          <p className="text-ink/50 font-medium mb-6">
            {t('आपका कार्ट खाली है', 'Your cart is empty')}
          </p>
          <button
            onClick={() => navigate('/food')}
            className="bg-primary text-white font-bold px-6 py-3 rounded-2xl shadow-pop active:scale-95 transition"
          >
            {t('खाना ऑर्डर करें', 'Order Food')}
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  const finalAmount = subtotal - discount + DELIVERY_FEE

  return (
    <div className="app-shell pb-40">
      <Header back title="Cart" titleHi="कार्ट" />

      <div className="px-4 pt-2 space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-3">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-cream flex items-center justify-center text-2xl overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                item.img
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink text-sm truncate">
                {language === 'hi' ? item.nameHi : item.name}
              </p>
              <p className="text-primary font-bold text-sm mt-0.5">₹{item.price} x {item.qty} = ₹{item.price * item.qty}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-primary rounded-xl px-1 py-1">
              <button
                onClick={() => decrementItem(item.id)}
                className="w-6 h-6 flex items-center justify-center text-white active:scale-90 transition"
                aria-label="Decrease"
              >
                <Minus size={14} />
              </button>
              <span className="text-white font-bold text-xs w-4 text-center">{item.qty}</span>
              <button
                onClick={() => addToCart(item)}
                className="w-6 h-6 flex items-center justify-center text-white active:scale-90 transition"
                aria-label="Increase"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-ink/30 active:text-red-500 transition"
              aria-label="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {/* Coupon section */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />
                <div>
                  <p className="font-bold text-sm text-ink">{appliedCoupon.code}</p>
                  <p className="text-xs text-green-600 font-medium">
                    {t('लागू किया गया', 'Applied')} — ₹{discount} {t('बचत', 'saved')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  removeCoupon()
                  setCouponMsg(null)
                }}
                className="text-ink/40 active:text-red-500"
                aria-label="Remove coupon"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Tag size={16} className="text-primary" />
                <p className="font-display font-700 text-sm text-ink">
                  {t('कूपन कोड लगाएं', 'Apply Coupon Code')}
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder={t('जैसे ZIMLO20', 'e.g. ZIMLO20')}
                  className="flex-1 bg-cream rounded-xl px-3 py-2 text-sm outline-none font-semibold tracking-wide"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                  className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl active:scale-95 transition shrink-0 disabled:opacity-50"
                >
                  {applyingCoupon ? '...' : t('लगाएं', 'Apply')}
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs mt-2 font-medium ${couponMsg.success ? 'text-green-600' : 'text-red-500'}`}>
                  {couponMsg.message}
                </p>
              )}
              <p className="text-[11px] text-ink/40 mt-2">
                {t('ट्राई करें:', 'Try:')} ZIMLO20, WELCOME50, ZIMLO10
              </p>
            </>
          )}
        </div>

        {/* Bill summary */}
        <div className="bg-white rounded-2xl shadow-card p-4 mt-4 space-y-2">
          <p className="font-display font-700 text-sm text-ink mb-1">
            {t('बिल विवरण', 'Bill Details')}
          </p>
          <div className="flex justify-between text-sm text-ink/70">
            <span>{t('आइटम कुल', 'Item Total')}</span>
            <span>₹{subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>{t('कूपन डिस्काउंट', 'Coupon Discount')}</span>
              <span>−₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-ink/70">
            <span>{t('डिलीवरी शुल्क', 'Delivery Fee')}</span>
            <span>₹{DELIVERY_FEE}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-black/5">
            <span>{t('कुल (COD शुल्क के बिना)', 'Total (before COD fee)')}</span>
            <span>₹{finalAmount}</span>
          </div>
          <p className="text-[11px] text-ink/40 pt-1 border-t border-black/5 mt-2">
            {t(
              'नोट: कैश ऑन डिलीवरी पर ₹20 अतिरिक्त सुविधा शुल्क लगेगा।',
              'Note: ₹20 extra convenience fee applies on Cash on Delivery.'
            )}
          </p>
        </div>
      </div>

      {/* Sticky checkout bar */}
      <div className="fixed bottom-[64px] left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-30">
        <button
          onClick={() => navigate('/checkout')}
          className="w-full flex items-center justify-between bg-primary text-white rounded-2xl px-5 py-4 shadow-pop active:scale-[0.98] transition"
        >
          <span className="font-bold">₹{finalAmount}</span>
          <span className="font-bold text-sm">
            {t('चेकआउट के लिए आगे बढ़ें →', 'Proceed to Checkout →')}
          </span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
