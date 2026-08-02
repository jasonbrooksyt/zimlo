import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Circle, Clock, CreditCard, FileText } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import RateOrderItems from '../components/RateOrderItems'
import { useStore } from '../store/useStore'
import { ORDER_STAGES } from '../data/menuData'
import { payWithRazorpay } from '../lib/razorpay'

// Shows the order's current status exactly as set by the admin — no
// client-side auto-advancing. The stage only moves forward when the admin
// updates it from the Admin Dashboard.
//
// For request-based orders (Custom / Services / Parcel / Grocery):
// 1. Admin sends a quote (amount + description)
// 2. Customer sees the quote and taps Accept
// 3. After accept, payment options unlock
export default function OrderTracking() {
  const { orderId } = useParams()
  const language = useStore((s) => s.language)
  const order = useStore((s) => s.getOrderById(orderId))
  const user = useStore((s) => s.user)
  const markOrderPaid = useStore((s) => s.markOrderPaid)
  const acceptQuote = useStore((s) => s.acceptQuote)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [accepting, setAccepting] = useState(false)

  const currentIndex = ORDER_STAGES.findIndex((s) => s.id === order?.status)

  const isRequestOrder = order && order.type !== 'food'
  const hasQuote = order?.priceConfirmed
  const quotePendingAccept = isRequestOrder && hasQuote && !order.quoteAccepted
  const quoteAccepted = isRequestOrder && hasQuote && order.quoteAccepted

  const needsPayment =
    quoteAccepted && order.paymentMethod === 'online' && !order.paid

  const handleAcceptQuote = async () => {
    setAccepting(true)
    await acceptQuote(order.id)
    setAccepting(false)
  }

  const handlePayNow = async () => {
    setPayError('')
    setPaying(true)
    try {
      const razorpayPayment = await payWithRazorpay({
        amount: order.total,
        name: 'Zimlo Order',
        description: order.id,
        contact: user?.phone
      })
      await markOrderPaid(order.id, razorpayPayment)
    } catch (err) {
      if (err.message !== 'Payment cancelled') setPayError(err.message)
    }
    setPaying(false)
  }

  if (!order) {
    return (
      <div className="app-shell pb-28">
        <Header back title="Track Order" titleHi="ऑर्डर ट्रैक करें" />
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <p className="text-ink/50 mb-4">{t('ऑर्डर नहीं मिला', 'Order not found')}</p>
          <Link to="/orders" className="text-primary font-semibold underline">
            {t('मेरे ऑर्डर देखें', 'View My Orders')}
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="app-shell pb-28">
      <Header back title="Track Order" titleHi="ऑर्डर ट्रैक करें" />

      <div className="px-4 pt-2">
        <div className="bg-white rounded-2xl shadow-card p-4 mb-5">
          <div className="flex items-center justify-between mb-1">
            <p className="font-display font-700 text-ink">{order.id}</p>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full capitalize">
              {order.type}
            </span>
          </div>
          <p className="text-xs text-ink/50">
            {new Date(order.createdAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN')}
          </p>

          {/* Waiting for admin quote */}
          {!hasQuote && isRequestOrder && (
            <p className="text-sm font-medium text-accent-dark mt-2 flex items-center gap-1">
              <Clock size={14} />
              {t('कीमत जल्द ही तय की जाएगी', 'Price to be confirmed by Zimlo team')}
            </p>
          )}

          {/* Quote received — show amount + description, Accept button */}
          {quotePendingAccept && (
            <div className="mt-3 bg-cream rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ink/60">
                <FileText size={13} className="text-primary" />
                {t('टीम का कोट', 'Quote from Zimlo')}
              </div>
              {order.adminNote && (
                <p className="text-sm text-ink/80 leading-relaxed">{order.adminNote}</p>
              )}
              <p className="font-display font-800 text-xl text-ink">₹{order.total}</p>
              <button
                onClick={handleAcceptQuote}
                disabled={accepting}
                className="w-full bg-primary text-white font-bold py-3 rounded-2xl shadow-pop active:scale-[0.98] transition disabled:opacity-50"
              >
                {accepting
                  ? t('सेव हो रहा है...', 'Saving...')
                  : t('कोट स्वीकार करें', 'Accept Quote')}
              </button>
            </div>
          )}

          {/* Quote accepted — show total + payment status */}
          {quoteAccepted && (
            <div className="mt-2">
              {order.adminNote && (
                <p className="text-xs text-ink/55 mb-1.5 leading-relaxed">{order.adminNote}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">₹{order.total}</p>
                {order.paymentMethod === 'online' ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {order.paid ? t('भुगतान हो गया', 'Paid') : t('भुगतान बाकी', 'Payment Pending')}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {t('COD / बाद में भुगतान', 'COD / Pay later')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Food orders — simple total */}
          {order.type === 'food' && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-bold text-ink">₹{order.total}</p>
              {order.paymentMethod === 'online' && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {order.paid ? t('भुगतान हो गया', 'Paid') : t('भुगतान बाकी', 'Payment Pending')}
                </span>
              )}
            </div>
          )}

          {needsPayment && (
            <div className="mt-3">
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-2xl shadow-pop active:scale-[0.98] transition disabled:opacity-50"
              >
                <CreditCard size={17} />
                {paying
                  ? t('भुगतान हो रहा है...', 'Processing...')
                  : t(`₹${order.total} भुगतान करें`, `Pay ₹${order.total} Now`)}
              </button>
              {payError && (
                <p className="text-red-600 text-xs font-medium mt-2 text-center">{payError}</p>
              )}
            </div>
          )}
        </div>

        {/* Stage timeline */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          {ORDER_STAGES.map((stage, i) => {
            const done = i <= currentIndex
            const isLast = i === ORDER_STAGES.length - 1
            return (
              <div key={stage.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {done ? (
                    <CheckCircle2 size={22} className="text-primary shrink-0" />
                  ) : (
                    <Circle size={22} className="text-ink/20 shrink-0" />
                  )}
                  {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-[28px] ${done ? 'bg-primary' : 'bg-ink/10'}`} />
                  )}
                </div>
                <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                  <p className={`font-semibold text-sm ${done ? 'text-ink' : 'text-ink/40'}`}>
                    {language === 'hi' ? stage.labelHi : stage.label}
                  </p>
                  {i === currentIndex && stage.id !== 'delivered' && (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {t('अभी यहाँ है...', 'In progress...')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {order.type === 'food' && order.status === 'delivered' && (
          <RateOrderItems order={order} />
        )}
      </div>

      <BottomNav />
    </div>
  )
}
