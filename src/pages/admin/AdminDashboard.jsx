import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package, Clock, CheckCircle2, UtensilsCrossed, ClipboardList, Tag } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabaseClient'
import { ORDER_STAGES, COD_FEE } from '../../data/menuData'
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
  const [priceDrafts, setPriceDrafts] = useState({}) // { orderId: { price, method } }

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

  const updateDraft = (orderId, field, value) => {
    setPriceDrafts((prev) => ({
      ...prev,
      [orderId]: { price: '', method: 'cod', ...prev[orderId], [field]: value }
    }))
  }

  const confirmPrice = (orderId) => {
    const draft = priceDrafts[orderId]
    if (!draft?.price || Number(draft.price) <= 0) return
    setOrderPrice(orderId, draft.price, draft.method || 'cod')
    setPriceDrafts((prev) => {
      const next = { ...prev }
      delete next[orderId]
      return next
    })
  }

  const pendingCount = orders.filter((o) => !o.priceConfirmed).length

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="bg-ink text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-display font-800 text-xl text-primary">Zimlo Admin</h1>
          <p className="text-white/50 text-xs">Order & menu management</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-lg"
        >
          <LogOut size={15} /> Log Out
        </button>
      </header>

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
                    </div>
                  )}

                  {/* Price entry for request-based orders */}
                  {!order.priceConfirmed && (
                    <div className="flex flex-wrap items-center gap-2 mb-2 bg-accent/10 rounded-xl p-3">
                      <input
                        type="number"
                        min="1"
                        placeholder="Set price (₹)"
                        value={draft.price}
                        onChange={(e) => updateDraft(order.id, 'price', e.target.value)}
                        className="flex-1 min-w-[100px] outline-none bg-white rounded-lg px-3 py-2 text-sm shadow-card"
                      />
                      <select
                        value={draft.method}
                        onChange={(e) => updateDraft(order.id, 'method', e.target.value)}
                        className="outline-none bg-white rounded-lg px-3 py-2 text-sm shadow-card"
                      >
                        <option value="cod">COD (+₹{COD_FEE})</option>
                        <option value="online">Online</option>
                      </select>
                      <button
                        onClick={() => confirmPrice(order.id)}
                        className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg active:scale-95 transition"
                      >
                        Confirm
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-sm">
                      {order.priceConfirmed ? `₹${order.total}` : 'Price not set'}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-sm font-semibold bg-cream rounded-lg px-3 py-1.5 outline-none"
                    >
                      {ORDER_STAGES.map((stage) => (
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
