import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useStore } from '../store/useStore'
import { ORDER_STAGES } from '../data/menuData'

// Shows the order's current status exactly as set by the admin — no
// client-side auto-advancing. The stage only moves forward when the admin
// updates it from the Admin Dashboard.
export default function OrderTracking() {
  const { orderId } = useParams()
  const language = useStore((s) => s.language)
  const order = useStore((s) => s.getOrderById(orderId))
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const currentIndex = ORDER_STAGES.findIndex((s) => s.id === order?.status)

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
            <p className="text-sm font-bold text-ink mt-2">₹{order.total}</p>
          ) : (
            <p className="text-sm font-medium text-accent-dark mt-2 flex items-center gap-1">
              <Clock size={14} />
              {t('कीमत जल्द ही तय की जाएगी', 'Price to be confirmed by Zimlo team')}
            </p>
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
      </div>

      <BottomNav />
    </div>
  )
}
