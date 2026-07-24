import { Link } from 'react-router-dom'
import { ClipboardList, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useStore } from '../store/useStore'

export default function Orders() {
  const language = useStore((s) => s.language)
  const allOrders = useStore((s) => s.orders)
  const user = useStore((s) => s.user)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  // Orders now come from a shared Supabase table (every customer's orders
  // together), so this MUST filter to the logged-in phone number — unlike
  // before, when each browser only ever held its own local orders.
  const orders = allOrders.filter((o) => o.customerPhone === user?.phone)

  return (
    <div className="app-shell pb-24">
      <Header title="My Orders" titleHi="मेरे ऑर्डर" />

      <div className="px-4 pt-2">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ClipboardList size={56} className="text-ink/20 mb-4" />
            <p className="text-ink/50 font-medium">{t('अभी कोई ऑर्डर नहीं है', 'No orders yet')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/track/${order.id}`}
                className="flex items-center justify-between bg-white rounded-2xl shadow-card p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-700 text-sm text-ink">{order.id}</p>
                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                      {order.type}
                    </span>
                  </div>
                  <p className="text-xs text-ink/50 mt-1">
                    {new Date(order.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN')}
                  </p>
                  <p className="text-xs font-semibold text-ink mt-1 capitalize">
                    {order.status.replace(/-/g, ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-ink/40">
                  <span className="font-bold text-ink text-sm">
                    {order.priceConfirmed ? `₹${order.total}` : t('कीमत बाकी', 'Pending')}
                  </span>
                  <ChevronRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
