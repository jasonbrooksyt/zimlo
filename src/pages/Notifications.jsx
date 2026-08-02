import { Link } from 'react-router-dom'
import { Bell, BellOff, ChevronRight, FileText, Package } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useStore } from '../store/useStore'
import { getStagesForOrder } from '../data/menuData'

function stageLabel(order, language) {
  const stages = getStagesForOrder(order)
  const stage = stages.find((s) => s.id === order.status)
  if (!stage) return order.status
  return language === 'hi' ? stage.labelHi : stage.label
}

export default function Notifications() {
  const language = useStore((s) => s.language)
  const allOrders = useStore((s) => s.orders)
  const user = useStore((s) => s.user)
  const seenNotifKeys = useStore((s) => s.seenNotifKeys)
  const orderNotifKey = useStore((s) => s.orderNotifKey)
  const clearNotifications = useStore((s) => s.clearNotifications)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const myOrders = allOrders
    .filter((o) => o.customerPhone === user?.phone)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const seen = new Set(seenNotifKeys || [])

  // Notifications = all non-delivered/cancelled updates, newest first
  const items = myOrders.map((o) => {
    const key = orderNotifKey(o)
    const unread = !seen.has(key) && o.status !== 'delivered' && o.status !== 'cancelled'
    let title
    let body
    if (o.status === 'cancelled') {
      title = t('ऑर्डर रद्द', 'Order cancelled')
      body = t('आपने यह ऑर्डर रद्द कर दिया', 'You cancelled this order')
    } else if (o.priceConfirmed && !o.quoteAccepted) {
      title = t('नया कोट मिला', 'New quote received')
      body = o.adminNote
        ? o.adminNote
        : t(`₹${o.total} — स्वीकार या रद्द करें`, `₹${o.total} — Accept or cancel`)
    } else if (o.priceConfirmed && o.quoteAccepted) {
      title = t('कोट स्वीकार हुआ', 'Quote accepted')
      body = t(`₹${o.total} · ${stageLabel(o, language)}`, `₹${o.total} · ${stageLabel(o, language)}`)
    } else {
      title = t('ऑर्डर अपडेट', 'Order update')
      body = stageLabel(o, language)
    }
    return { order: o, key, unread, title, body }
  })

  const unreadCount = items.filter((i) => i.unread).length

  return (
    <div className="app-shell pb-24">
      <Header back title="Notifications" titleHi="सूचनाएँ" />

      <div className="px-4 pt-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-ink/50">
            {unreadCount > 0
              ? t(`${unreadCount} नई`, `${unreadCount} new`)
              : t('कोई नई सूचना नहीं', 'No new notifications')}
          </p>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => clearNotifications()}
              className="flex items-center gap-1 text-xs font-bold text-primary active:opacity-70"
            >
              <BellOff size={13} />
              {t('सब क्लियर', 'Clear all')}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bell size={48} className="text-ink/20 mb-3" />
            <p className="text-ink/50 font-medium">{t('अभी कोई सूचना नहीं', 'No notifications yet')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(({ order, key, unread, title, body }) => (
              <Link
                key={key + order.id}
                to={`/track/${order.id}`}
                className={`flex items-start gap-3 rounded-2xl p-3.5 shadow-card transition ${
                  unread ? 'bg-primary/5 border border-primary/15' : 'bg-white'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    order.priceConfirmed && !order.quoteAccepted
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {order.priceConfirmed && !order.quoteAccepted ? (
                    <FileText size={16} />
                  ) : (
                    <Package size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-ink truncate">{title}</p>
                    {unread && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-ink/55 mt-0.5 line-clamp-2">{body}</p>
                  <p className="text-[10px] text-ink/40 mt-1">
                    {order.id} ·{' '}
                    {new Date(order.createdAt).toLocaleString(
                      language === 'hi' ? 'hi-IN' : 'en-IN',
                      { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
                    )}
                  </p>
                </div>
                <ChevronRight size={16} className="text-ink/30 shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
