import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Banknote, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import { useStore } from '../store/useStore'
import { COD_FEE, DELIVERY_FEE } from '../data/menuData'

export default function Checkout() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const cart = useStore((s) => s.cart)
  const subtotal = useStore((s) => s.cartSubtotal())
  const calculateTotal = useStore((s) => s.calculateTotal)
  const placeFoodOrder = useStore((s) => s.placeFoodOrder)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [placedOrder, setPlacedOrder] = useState(null)

  const total = calculateTotal(paymentMethod)

  const handlePlaceOrder = () => {
    if (!address.trim()) return
    const order = placeFoodOrder({ paymentMethod, address: address.trim(), notes: notes.trim() })
    setPlacedOrder(order)
  }

  if (placedOrder) {
    return (
      <div className="app-shell flex flex-col items-center justify-center px-6 min-h-screen text-center">
        <CheckCircle2 size={64} className="text-green-600 mb-4" />
        <h2 className="font-display font-700 text-xl text-ink mb-2">
          {t('ऑर्डर कन्फर्म हो गया!', 'Order Confirmed!')}
        </h2>
        <p className="text-ink/60 text-sm mb-1">
          {t('ऑर्डर आईडी', 'Order ID')}: <span className="font-semibold text-ink">{placedOrder.id}</span>
        </p>
        <p className="text-ink/60 text-sm mb-6">
          {t('कुल राशि', 'Total Amount')}: <span className="font-semibold text-ink">₹{placedOrder.total}</span>
        </p>
        <button
          onClick={() => navigate(`/track/${placedOrder.id}`)}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition mb-3"
        >
          {t('ऑर्डर ट्रैक करें', 'Track Order')}
        </button>
        <button onClick={() => navigate('/home')} className="w-full text-ink/60 font-medium text-sm py-2">
          {t('होम पर जाएं', 'Back to Home')}
        </button>
      </div>
    )
  }

  return (
    <div className="app-shell pb-32">
      <Header back title="Checkout" titleHi="चेकआउट" />

      <div className="px-4 pt-2 space-y-5">
        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {t('डिलीवरी पता', 'Delivery Address')}
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('पूरा पता लिखें (घर नं., मोहल्ला, लैंडमार्क)', 'Full address (house no., area, landmark)')}
            rows={2}
            required
            className="w-full bg-white rounded-2xl shadow-card p-4 outline-none text-sm text-ink placeholder:text-ink/30 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {t('इंस्ट्रक्शन (वैकल्पिक)', 'Delivery Instructions (optional)')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('जैसे: कम मसाला, दरवाज़ा नंबर 3', 'e.g. less spicy, door number 3')}
            rows={2}
            className="w-full bg-white rounded-2xl shadow-card p-4 outline-none text-sm text-ink placeholder:text-ink/30 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-2 block">
            {t('भुगतान का तरीका चुनें', 'Choose Payment Method')}
          </label>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('online')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                paymentMethod === 'online' ? 'border-primary bg-primary/10' : 'border-black/10 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet size={22} className="text-primary" />
                <div className="text-left">
                  <p className="font-semibold text-sm text-ink">{t('ऑनलाइन भुगतान', 'Pay Online')}</p>
                  <p className="text-xs text-ink/50">UPI / Card / Wallet — {t('कोई अतिरिक्त शुल्क नहीं', 'no extra charge')}</p>
                </div>
              </div>
              <span className="font-bold text-ink">₹{subtotal + DELIVERY_FEE}</span>
            </button>

            <button
              onClick={() => setPaymentMethod('cod')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                paymentMethod === 'cod' ? 'border-primary bg-primary/10' : 'border-black/10 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Banknote size={22} className="text-primary" />
                <div className="text-left">
                  <p className="font-semibold text-sm text-ink">{t('कैश ऑन डिलीवरी', 'Cash on Delivery')}</p>
                  <p className="text-xs text-ink/50">+₹{COD_FEE} {t('सुविधा शुल्क', 'convenience fee')}</p>
                </div>
              </div>
              <span className="font-bold text-ink">₹{subtotal + DELIVERY_FEE + COD_FEE}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4 space-y-2">
          <div className="flex justify-between text-sm text-ink/70">
            <span>{t('आइटम कुल', 'Item Total')}</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm text-ink/70">
            <span>{t('डिलीवरी शुल्क', 'Delivery Fee')}</span>
            <span>₹{DELIVERY_FEE}</span>
          </div>
          {paymentMethod === 'cod' && (
            <div className="flex justify-between text-sm text-ink/70">
              <span>{t('सुविधा शुल्क (COD)', 'Convenience Fee (COD)')}</span>
              <span>₹{COD_FEE}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-black/5">
            <span>{t('कुल भुगतान', 'To Pay')}</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-cream border-t border-black/5">
        <button
          onClick={handlePlaceOrder}
          disabled={!address.trim()}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition disabled:opacity-40 disabled:active:scale-100"
        >
          {t(`₹${total} का ऑर्डर करें`, `Place Order — ₹${total}`)}
        </button>
      </div>
    </div>
  )
}
