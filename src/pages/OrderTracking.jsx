import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Circle, Clock, CreditCard } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import RateOrderItems from '../components/RateOrderItems'
import { useStore } from '../store/useStore'
import { ORDER_STAGES } from '../data/menuData'
import { payWithRazorpay } from '../lib/razorpay'

// Shows the order's current status exactly as set by the admin — no
// client-side auto-advancing. The stage only moves forward when the admin
// updates it from the Admin Dashboard.
export default function OrderTracking() {
  const { orderId } = useParams()
  const language = useStore((s) => s.language)
  const order = useStore((s) => s.getOrderById(orderId))
  const user = useStore((s) => s.user)
  const markOrderPaid = useStore((s) => s.markOrderPaid)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  const currentIndex = ORDER_STAGES.findIndex((s) => s.id === order?.status)

  const needsPayment =
    order &&
    order.type !== 'food' &&
    order.priceConfirmed &&
    order.paymentMethod === 'online' &&
    !order.paid

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
          {order.priceConfirmed ? (
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
          ) : (
            <p className="text-sm font-medium text-accent-dark mt-2 flex items-center gap-1">
              <Clock size={14} />
              {t('कीमत जल्द ही तय की जाएगी', 'Price to be confirmed by Zimlo team')}
            </p>
          )}

          {needsPayment && (
            <div className="mt-3">
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-2xl shadow-pop active:scale-[0.98] transition disabled:opacity-50"
              >
                <CreditCard size={17} />
                {paying ? t('भुगतान हो रहा है...', 'Processing...') : t(`₹${order.total} भुगतान करें`, `Pay ₹${order.total} Now`)}
              </button>
              {payError && <p className="text-red-600 text-xs font-medium mt-2 text-center">{payError}</p>}
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
