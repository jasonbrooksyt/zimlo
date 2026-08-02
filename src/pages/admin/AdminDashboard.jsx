import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package, Clock, CheckCircle2, UtensilsCrossed, ClipboardList, Tag, Bell, BellRing, X } from 'lucide-react'
import { useAdminOrderAlerts } from '../../hooks/useAdminOrderAlerts'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabaseClient'
import { COD_FEE, getStagesForOrder } from '../../data/menuData'
import MenuManagement from './MenuManagement'
import CouponManagement from './CouponManagement'

// Admin dashboard — two tabs:
// 1. Orders — lists every order across Food and all request-based
//    categories, lets admin set prices for request orders, and move any
//    order through delivery stages.
// 2. Menu — full CRUD on the live `dishes` table (Supabase), so price /
//    name corrections show up for every customer immediately, no redeploy.
export default function AdminDashboard() {
  const navigate = useNavigate()
  const orders = useStore((s) => s.orders)
  const setOrderPrice = useStore((s) => s.setOrderPrice)
  const updateOrderStatus = useStore((s) => s.updateOrderStatus)

  const [view, setView] = useState('orders') // 'orders' | 'menu'
  const [filter, setFilter] = useState('all') // all | pending-price | food | requests
  const [priceDrafts, setPriceDrafts] = useState({}) // { orderId: { price, method, note } }

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    navigate('/admin/login')
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'pending-price') return !o.priceConfirmed
    if (filter === 'food') return o.type === 'food'
    if (filter === 'requests') return o.type !== 'food'
    return true
  })

  const isServiceOrder = (o) =>
    o.paymentMethodPreference === 'enquiry' ||
    ['tiffin', 'plumber', 'electrician', 'carpenter', 'fabrication', 'mechanic', 'transport', 'other-service'].includes(
      o.type
    )

  const updateDraft = (orderId, field, value) => {
    setPriceDrafts((prev) => ({
      ...prev,
      [orderId]: { price: '', method: 'online', note: '', ...prev[orderId], [field]: value }
    }))
  }

  const confirmPrice = (orderId) => {
    const draft = priceDrafts[orderId]
    if (!draft?.price || Number(draft.price) <= 0) return
    setOrderPrice(orderId, draft.price, draft.method || 'online', draft.note || '')
    setPriceDrafts((prev) => {
      const next = { ...prev }
      delete next[orderId]
      return next
    })
  }

  const pendingCount = orders.filter((o) => !o.priceConfirmed).length
  const { toast, dismissToast, permission, requestPermission } = useAdminOrderAlerts(true)


  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="bg-ink text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-display font-800 text-xl text-primary">Zimlo Admin</h1>
          <p className="text-white/50 text-xs">Order & menu management</p>
        </div>
        <div className="flex items-center gap-2">
          {permission !== 'granted' && (
            <button
              type="button"
              onClick={requestPermission}
              className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg active:scale-95 transition"
            >
              <Bell size={14} /> Enable alerts
            </button>
          )}
          {permission === 'granted' && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-green-400 font-medium">
              <BellRing size={14} /> Alerts on
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-lg"
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </header>

      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,420px)] bg-ink text-white rounded-2xl shadow-2xl px-4 py-3 flex items-start gap-3 border border-primary/40">
          <BellRing size={20} className="text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{toast.title}</p>
            <p className="text-xs text-white/70 mt-0.5">{toast.body}</p>
          </div>
          <button type="button" onClick={dismissToast} className="text-white/50" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {/* View switcher */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4">
        <div className="flex gap-1.5 bg-white rounded-2xl shadow-card p-1.5">
          <button
            onClick={() => setView('orders')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition ${
              view === 'orders' ? 'bg-primary text-white' : 'text-ink/60'
            }`}
          >
            <ClipboardList size={16} /> Orders
            {pendingCount > 0 && (
              <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setView('menu')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition ${
              view === 'menu' ? 'bg-primary text-white' : 'text-ink/60'
            }`}
          >
            <UtensilsCrossed size={16} /> Menu
          </button>
          <button
            onClick={() => setView('coupons')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition ${
              view === 'coupons' ? 'bg-primary text-white' : 'text-ink/60'
            }`}
          >
            <Tag size={16} /> Coupons
          </button>
        </div>
      </div>

      {view === 'menu' ? (
        <MenuManagement />
      ) : view === 'coupons' ? (
        <CouponManagement />
      ) : (
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl shadow-card p-4">
              <Package size={18} className="text-primary mb-1" />
              <p className="text-2xl font-bold text-ink">{orders.length}</p>
              <p className="text-xs text-ink/50">Total Orders</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-4">
              <Clock size={18} className="text-accent-dark mb-1" />
              <p className="text-2xl font-bold text-ink">{pendingCount}</p>
              <p className="text-xs text-ink/50">Pending Price</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-4">
              <CheckCircle2 size={18} className="text-green-600 mb-1" />
              <p className="text-2xl font-bold text-ink">
                {orders.filter((o) => o.status === 'delivered').length}
              </p>
              <p className="text-xs text-ink/50">Delivered</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending-price', label: 'Pending Price' },
              { id: 'food', label: 'Food' },
              { id: 'requests', label: 'Requests' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  filter === f.id ? 'bg-primary text-white' : 'bg-white text-ink/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Orders list */}
          <div className="space-y-3">
            {filteredOrders.length === 0 && (
              <p className="text-center text-ink/40 py-16">No orders in this view</p>
            )}

            {filteredOrders.map((order) => {
              const draft = priceDrafts[order.id] || { price: '', method: 'cod' }
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-700 text-ink">{order.id}</p>
                      <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                        {order.type}
                      </span>
                    </div>
                    <p className="text-xs text-ink/40">
                      {new Date(order.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <p className="text-xs text-ink/50 mb-1">Customer: {order.customerPhone}</p>
                  <p className="text-xs text-ink/50 mb-2">Address: {order.address}</p>

                  {order.type === 'food' ? (
                    <div className="bg-cream rounded-xl p-3 mb-2 text-xs text-ink/70">
                      {order.items.map((it) => (
                        <p key={it.id}>
                          {it.name} x{it.qty} — ₹{it.price * it.qty}
                        </p>
                      ))}
                      {order.discount > 0 && (
                        <p className="text-green-600 font-medium">
                          Coupon {order.couponCode}: −₹{order.discount}
                        </p>
                      )}
                      {order.notes && <p className="mt-1 italic">Note: {order.notes}</p>}
                    </div>
                  ) : (
                    <div className="bg-cream rounded-xl p-3 mb-2 text-xs text-ink/70">
                      <p className="font-semibold text-ink/80 mb-1">Requirement:</p>
                      <p>{order.requirement}</p>
                      {order.attachmentUrl && (
                        <a href={order.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                          <img
                            src={order.attachmentUrl}
                            alt="Attachment"
                            className="w-20 h-20 object-cover rounded-lg shadow-card"
                          />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Quote entry for request-based orders — amount + description */}
                  {!order.priceConfirmed && (
                    <div className="mb-2 bg-accent/10 rounded-xl p-3 space-y-2">
                      <textarea
                        placeholder="Description / reply to customer (optional)"
                        value={draft.note || ''}
                        onChange={(e) => updateDraft(order.id, 'note', e.target.value)}
                        rows={2}
                        className="w-full outline-none bg-white rounded-lg px-3 py-2 text-sm shadow-card resize-none"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Amount (₹)"
                          value={draft.price}
                          onChange={(e) => updateDraft(order.id, 'price', e.target.value)}
                          className="flex-1 min-w-[100px] outline-none bg-white rounded-lg px-3 py-2 text-sm shadow-card"
                        />
                        <select
                          value={draft.method || 'online'}
                          onChange={(e) => updateDraft(order.id, 'method', e.target.value)}
                          className="outline-none bg-white rounded-lg px-3 py-2 text-sm shadow-card"
                        >
                          {isServiceOrder(order) ? (
                            <>
                              <option value="online">Online</option>
                              <option value="cod">Pay later / COD (no fee)</option>
                            </>
                          ) : (
                            <>
                              <option value="online">Online</option>
                              <option value="cod">COD (+₹{COD_FEE})</option>
                            </>
                          )}
                        </select>
                        <button
                          onClick={() => confirmPrice(order.id)}
                          className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg active:scale-95 transition"
                        >
                          Send Quote
                        </button>
                      </div>
                    </div>
                  )}

                  {order.priceConfirmed && order.adminNote && (
                    <div className="mb-2 bg-cream rounded-xl p-3 text-xs text-ink/70">
                      <p className="font-semibold text-ink/80 mb-0.5">Quote note:</p>
                      <p>{order.adminNote}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-sm">
                      {order.priceConfirmed
                        ? `₹${order.total}${order.quoteAccepted ? ' · Accepted' : ' · Awaiting customer'}`
                        : 'Price not set'}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-sm font-semibold bg-cream rounded-lg px-3 py-1.5 outline-none"
                    >
                      {getStagesForOrder(order).map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
