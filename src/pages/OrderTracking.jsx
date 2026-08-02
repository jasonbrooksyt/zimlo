import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Circle, Clock, CreditCard, FileText, XCircle, Phone } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import RateOrderItems from '../components/RateOrderItems'
import { useStore } from '../store/useStore'
import { getStagesForOrder, canCustomerCancel, isServiceType } from '../data/menuData'
import { payWithRazorpay } from '../lib/razorpay'

export default function OrderTracking() {
  const { orderId } = useParams()
  const language = useStore((s) => s.language)
  const order = useStore((s) => s.getOrderById(orderId))
  const user = useStore((s) => s.user)
  const markOrderPaid = useStore((s) => s.markOrderPaid)
  const acceptQuote = useStore((s) => s.acceptQuote)
  const cancelOrder = useStore((s) => s.cancelOrder)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const stages = getStagesForOrder(order).filter((s) => s.id !== 'cancelled')
  const currentIndex = stages.findIndex((s) => s.id === order?.status)
  const isCancelled = order?.status === 'cancelled'
  const isService = order && (order.paymentMethodPreference === 'enquiry' || isServiceType(order.type))

  const isRequestOrder = order && order.type !== 'food'
  const hasQuote = order?.priceConfirmed
  const quotePendingAccept = isRequestOrder && hasQuote && !order.quoteAccepted && !isCancelled
  const quoteAccepted = isRequestOrder && hasQuote && order.quoteAccepted && !isCancelled

  const needsPayment =
    quoteAccepted && order.paymentMethod === 'online' && !order.paid

  const showCancel = order && canCustomerCancel(order)

  const handleAcceptQuote = async () => {
    setAccepting(true)
    await acceptQuote(order.id)
    setAccepting(false)
  }

  const handleCancel = async () => {
    if (!window.confirm(t('क्या आप वाकई रद्द करना चाहते हैं?', 'Are you sure you want to cancel?'))) {
      return
    }
    setCancelling(true)
    await cancelOrder(order.id)
    setCancelling(false)
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

          {isCancelled && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-3 py-2.5 text-sm font-semibold">
              <XCircle size={16} />
              {t('यह ऑर्डर / enquiry रद्द हो चुकी है', 'This order / enquiry has been cancelled')}
            </div>
          )}

          {!hasQuote && isRequestOrder && !isCancelled && (
            <p className="text-sm font-medium text-accent-dark mt-2 flex items-center gap-1">
              <Clock size={14} />
              {t('कीमत जल्द ही तय की जाएगी', 'Price to be confirmed by Zimlo team')}
            </p>
          )}

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
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full border-2 border-red-200 text-red-600 font-bold py-2.5 rounded-2xl active:scale-[0.98] transition disabled:opacity-50 text-sm"
                >
                  {cancelling ? t('...', '...') : t('रद्द करें', 'Cancel')}
                </button>
                <button
                  onClick={handleAcceptQuote}
                  disabled={accepting}
                  className="w-full bg-primary text-white font-bold py-2.5 rounded-2xl shadow-pop active:scale-[0.98] transition disabled:opacity-50 text-sm"
                >
                  {accepting
                    ? t('सेव...', 'Saving...')
                    : t('स्वीकार करें', 'Accept')}
                </button>
              </div>
              <a
                href="tel:+919232878806"
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary pt-0.5"
              >
                <Phone size={12} />
                {t('कॉल बैक / बात करें', 'Call back / Talk to us')}
              </a>
            </div>
          )}

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

          {order.type === 'food' && !isCancelled && (
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

          {showCancel && !quotePendingAccept && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full mt-3 border border-red-200 text-red-600 font-semibold py-2.5 rounded-2xl text-sm active:scale-[0.98] transition disabled:opacity-50"
            >
              {cancelling
                ? t('रद्द हो रहा है...', 'Cancelling...')
                : t('ऑर्डर रद्द करें', 'Cancel Order')}
            </button>
          )}
        </div>

        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-card p-5">
            {isService && (
              <p className="text-[11px] font-semibold text-ink/45 mb-3 uppercase tracking-wide">
                {t('सेवा स्थिति', 'Service status')}
              </p>
            )}
            {stages.map((stage, i) => {
              const done = currentIndex >= 0 && i <= currentIndex
              const isLast = i === stages.length - 1
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
        )}

        {order.type === 'food' && order.status === 'delivered' && (
          <RateOrderItems order={order} />
        )}
      </div>

      <BottomNav />
    </div>
  )
}
