import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Banknote, CheckCircle2, User, MapPin, Phone, Landmark } from 'lucide-react'
import Header from '../components/Header'
import AddressInput from '../components/AddressInput'
import { emptyAddressFields, isAddressComplete, formatAddressBlock } from '../lib/addressFormat'
import { useStore } from '../store/useStore'
import { COD_FEE, MIN_ORDER_AMOUNT } from '../data/menuData'
import { payWithRazorpay } from '../lib/razorpay'

const DEFAULTS_KEY = 'zimlo_checkout_defaults'

function loadDefaults() {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveDefaults(data) {
  try {
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(data))
  } catch {
    /* ignore quota errors */
  }
}

export default function Checkout() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const user = useStore((s) => s.user)
  const cart = useStore((s) => s.cart)
  const subtotal = useStore((s) => s.cartSubtotal())
  const appliedCoupon = useStore((s) => s.appliedCoupon)
  const discount = useStore((s) => s.couponDiscount())
  const deliveryFee = useStore((s) => s.deliveryFeeAmount())
  const calculateTotal = useStore((s) => s.calculateTotal)
  const placeFoodOrder = useStore((s) => s.placeFoodOrder)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const defaults = loadDefaults()

  const cleanName = (n) => {
    if (!n || n.trim() === '' || n.trim() === 'Zimlo Customer') return ''
    return n.trim()
  }
  const [addressFields, setAddressFields] = useState(() =>
    emptyAddressFields({
      fullName: cleanName(defaults?.fullName) || cleanName(user?.name) || '',
      addressLine: defaults?.address || defaults?.addressLine || '',
      landmark: defaults?.landmark || '',
      mobile: defaults?.mobile || user?.phone || ''
    })
  )
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [placedOrder, setPlacedOrder] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // If user logs in later / profile updates, fill empty fields only
  useEffect(() => {
    setAddressFields((prev) => ({
      ...prev,
      fullName: prev.fullName || cleanName(user?.name) || '',
      mobile: prev.mobile || user?.phone || ''
    }))
  }, [user])

  const total = calculateTotal(paymentMethod)
  const isFormValid = isAddressComplete(addressFields)
  const fullName = addressFields.fullName || ''
  const mobile = addressFields.mobile || ''

  const buildFullAddress = () => formatAddressBlock(addressFields, language)

  const handlePlaceOrder = async () => {
    if (!isFormValid || placing) return
    if (subtotal < MIN_ORDER_AMOUNT) {
      setPaymentError(
        t(
          `न्यूनतम ऑर्डर राशि ₹${MIN_ORDER_AMOUNT} है`,
          `Minimum order amount is ₹${MIN_ORDER_AMOUNT}`
        )
      )
      return
    }

    setPaymentError('')
    setPlacing(true)

    // Remember for next orders (like other delivery apps)
    saveDefaults({
      fullName: addressFields.fullName.trim(),
      address: addressFields.addressLine.trim(),
      addressLine: addressFields.addressLine.trim(),
      landmark: addressFields.landmark.trim(),
      mobile: addressFields.mobile.trim()
    })

    const fullAddress = buildFullAddress()
    const orderNotes = notes.trim()

    if (paymentMethod === 'online') {
      try {
        const razorpayPayment = await payWithRazorpay({
          items: cart.map((item) => ({ id: item.id, qty: item.qty })),
          couponCode: appliedCoupon?.code || null,
          paymentMethod,
          customerPhone: mobile.trim(),
          hasReferral:
            typeof window !== 'undefined' && localStorage.getItem('zimlo_referral_pending') === 'true',
          name: fullName.trim() || 'Zimlo Order',
          contact: mobile.trim()
        })
        const order = await placeFoodOrder({
          paymentMethod,
          address: fullAddress,
          notes: orderNotes,
          razorpayPayment,
          customerPhone: mobile.trim()
        })
        setPlacing(false)
        if (order && !order.error) setPlacedOrder(order)
        else
          setPaymentError(
            order?.error ||
              t(
                'भुगतान हो गया लेकिन ऑर्डर सेव नहीं हुआ — सपोर्ट से संपर्क करें',
                'Payment succeeded but order could not be saved — please contact support'
              )
          )
      } catch (err) {
        setPlacing(false)
        setPaymentError(err.message === 'Payment cancelled' ? '' : err.message)
      }
      return
    }

    const order = await placeFoodOrder({
      paymentMethod,
      address: fullAddress,
      notes: orderNotes,
      customerPhone: mobile.trim()
    })
    setPlacing(false)
    if (order && !order.error) {
      setPlacedOrder(order)
    } else {
      const detail = order?.error || ''
      setPaymentError(
        detail
          ? detail
          : t(
              'ऑर्डर सेव नहीं हुआ — कीमतें बदल गई होंगी, कृपया कार्ट दोबारा जांचें',
              'Order could not be placed — prices may have changed, please check your cart and try again'
            )
      )
    }
  }

  if (placedOrder) {
    return (
      <div className="app-shell flex flex-col items-center justify-center px-6 min-h-screen text-center">
        <CheckCircle2 size={64} className="text-green-600 mb-4" />
        <h2 className="font-display font-700 text-xl text-ink mb-2">
          {t('ऑर्डर कन्फर्म हो गया!', 'Order Confirmed!')}
        </h2>
        <p className="text-ink/60 text-sm mb-1">
          {t('ऑर्डर आईडी', 'Order ID')}:{' '}
          <span className="font-semibold text-ink">{placedOrder.id}</span>
        </p>
        <p className="text-ink/60 text-sm mb-6">
          {t('कुल राशि', 'Total Amount')}:{' '}
          <span className="font-semibold text-ink">₹{placedOrder.total}</span>
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
        {/* Delivery contact — name, address, landmark, mobile */}
        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {t('डिलीवरी विवरण', 'Delivery details')}
          </label>
          <AddressInput value={addressFields} onChange={setAddressFields} />
        </div>

        {/* Delivery instructions */}
        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {t('इंस्ट्रक्शन (वैकल्पिक)', 'Delivery Instructions (optional)')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('जैसे कम तीखा, घर नं. 3', 'e.g. less spicy, door number 3')}
            rows={2}
            className="w-full bg-white rounded-2xl shadow-card p-4 outline-none text-sm text-ink placeholder:text-ink/30 resize-none"
          />
        </div>

        {/* Payment method */}
        <div>
          <p className="text-sm font-semibold text-ink/70 mb-2">
            {t('भुगतान विधि चुनें', 'Choose Payment Method')}
          </p>
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                paymentMethod === 'online'
                  ? 'border-primary bg-primary/5'
                  : 'border-black/8 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet size={20} className="text-primary" />
                <div className="text-left">
                  <p className="font-semibold text-sm text-ink">{t('ऑनलाइन भुगतान', 'Pay Online')}</p>
                  <p className="text-[11px] text-ink/50">
                    {t('UPI / कार्ड / वॉलेट — कोई अतिरिक्त शुल्क नहीं', 'UPI / Card / Wallet — no extra charge')}
                  </p>
                </div>
              </div>
              <span className="font-bold text-ink">₹{subtotal - discount + deliveryFee}</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                paymentMethod === 'cod'
                  ? 'border-primary bg-primary/5'
                  : 'border-black/8 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Banknote size={20} className="text-primary" />
                <div className="text-left">
                  <p className="font-semibold text-sm text-ink">{t('कैश ऑन डिलीवरी', 'Cash on Delivery')}</p>
                  <p className="text-[11px] text-ink/50">
                    +₹{COD_FEE} {t('सुविधा शुल्क', 'convenience fee')}
                  </p>
                </div>
              </div>
              <span className="font-bold text-ink">
                ₹{subtotal - discount + deliveryFee + COD_FEE}
              </span>
            </button>
          </div>
        </div>

        {/* Bill summary */}
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-2">
          <div className="flex justify-between text-sm text-ink/70">
            <span>{t('आइटम कुल', 'Item Total')}</span>
            <span>₹{subtotal}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>
                {t('कूपन डिस्काउंट', 'Coupon Discount')}{' '}
                {appliedCoupon ? `(${appliedCoupon.code})` : ''}
              </span>
              <span>−₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-ink/70">
            <span>{t('डिलीवरी शुल्क', 'Delivery Fee')}</span>
            {deliveryFee === 0 ? (
              <span className="text-green-600 font-bold">{t('मुफ़्त', 'FREE')}</span>
            ) : (
              <span>₹{deliveryFee}</span>
            )}
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

        {subtotal < MIN_ORDER_AMOUNT && (
          <p className="text-amber-700 text-sm font-medium text-center bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            {t(
              `न्यूनतम ऑर्डर ₹${MIN_ORDER_AMOUNT} है — कार्ट में ₹${MIN_ORDER_AMOUNT - subtotal} और जोड़ें`,
              `Minimum order is ₹${MIN_ORDER_AMOUNT} — add ₹${MIN_ORDER_AMOUNT - subtotal} more to cart`
            )}
          </p>
        )}
        {paymentError && (
          <p className="text-red-600 text-sm font-medium text-center">{paymentError}</p>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-white border-t border-black/5">
        <button
          onClick={handlePlaceOrder}
          disabled={!isFormValid || placing || subtotal < MIN_ORDER_AMOUNT}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition disabled:opacity-40 disabled:active:scale-100"
        >
          {placing
            ? paymentMethod === 'online'
              ? t('भुगतान हो रहा है...', 'Processing payment...')
              : t('ऑर्डर हो रहा है...', 'Placing order...')
            : t(`₹${total} का ऑर्डर करें`, `Place Order — ₹${total}`)}
        </button>
      </div>
    </div>
  )
}
