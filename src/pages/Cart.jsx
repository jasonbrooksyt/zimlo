import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
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
  const t = (hi, en) => (language === 'hi' ? hi : en)

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

  return (
    <div className="app-shell pb-40">
      <Header back title="Cart" titleHi="कार्ट" />

      <div className="px-4 pt-2 space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-3">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-cream flex items-center justify-center text-2xl">
              {item.img}
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

        {/* Bill summary */}
        <div className="bg-white rounded-2xl shadow-card p-4 mt-4 space-y-2">
          <p className="font-display font-700 text-sm text-ink mb-1">
            {t('बिल विवरण', 'Bill Details')}
          </p>
          <div className="flex justify-between text-sm text-ink/70">
            <span>{t('आइटम कुल', 'Item Total')}</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm text-ink/70">
            <span>{t('डिलीवरी शुल्क', 'Delivery Fee')}</span>
            <span>₹{DELIVERY_FEE}</span>
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
          <span className="font-bold">₹{subtotal + DELIVERY_FEE}</span>
          <span className="font-bold text-sm">
            {t('चेकआउट के लिए आगे बढ़ें →', 'Proceed to Checkout →')}
          </span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
