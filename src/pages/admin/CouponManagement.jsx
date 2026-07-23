import { useCallback, useEffect, useState } from 'react'
import { Trash2, Save, Plus, Loader2, AlertTriangle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'

// Full CRUD on the live `coupons` table — replaces the old hardcoded
// coupon list. Customers validate codes against this same table at
// checkout (see useStore's applyCoupon), so a new code here is usable
// immediately, and toggling "active" off retires one without deleting it.
export default function CouponManagement() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [savingCode, setSavingCode] = useState(null)
  const [toast, setToast] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'flat',
    value: '',
    minOrder: '',
    maxDiscount: '',
    label: ''
  })

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCoupons(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const getDraft = (coupon) => drafts[coupon.code] || coupon
  const setDraftField = (code, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [code]: { ...(prev[code] || coupons.find((c) => c.code === code)), [field]: value }
    }))
  }

  const handleSave = async (code) => {
    const draft = drafts[code]
    if (!draft) return
    setSavingCode(code)
    const { error: updateError } = await supabase
      .from('coupons')
      .update({
        type: draft.type,
        value: Number(draft.value),
        min_order: Number(draft.min_order),
        max_discount: draft.max_discount ? Number(draft.max_discount) : null,
        label: draft.label,
        active: draft.active
      })
      .eq('code', code)
    setSavingCode(null)
    if (updateError) {
      showToast('error', updateError.message)
      return
    }
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[code]
      return next
    })
    showToast('success', 'Saved')
    refetch()
  }

  const handleToggleActive = async (coupon) => {
    const { error: updateError } = await supabase
      .from('coupons')
      .update({ active: !coupon.active })
      .eq('code', coupon.code)
    if (updateError) {
      showToast('error', updateError.message)
      return
    }
    refetch()
  }

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return
    const { error: deleteError } = await supabase.from('coupons').delete().eq('code', code)
    if (deleteError) {
      showToast('error', deleteError.message)
      return
    }
    showToast('success', 'Deleted')
    refetch()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const code = newCoupon.code.trim().toUpperCase()
    if (!code || !newCoupon.value || !newCoupon.label.trim()) {
      showToast('error', 'Fill in code, value and label')
      return
    }
    setAdding(true)
    const { error: insertError } = await supabase.from('coupons').insert({
      code,
      type: newCoupon.type,
      value: Number(newCoupon.value),
      min_order: Number(newCoupon.minOrder) || 0,
      max_discount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : null,
      label: newCoupon.label.trim(),
      active: true
    })
    setAdding(false)
    if (insertError) {
      showToast('error', insertError.message)
      return
    }
    setNewCoupon({ code: '', type: 'flat', value: '', minOrder: '', maxDiscount: '', label: '' })
    setShowAddForm(false)
    showToast('success', 'Coupon added')
    refetch()
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800">
            Coupon management needs Supabase connected. Add VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY, then redeploy.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-20">
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-700 text-lg text-ink">Coupon Management</h2>
          <p className="text-xs text-ink/50">{coupons.length} coupons</p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-3 py-2 rounded-xl active:scale-95 transition"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {error && <p className="text-red-600 text-sm font-medium mb-4">{error}</p>}

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-card p-4 mb-5 space-y-3">
          <p className="font-semibold text-sm text-ink">New Coupon</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="CODE (e.g. ZIMLO20)"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
              className="bg-cream rounded-lg px-3 py-2 text-sm outline-none font-semibold"
            />
            <select
              value={newCoupon.type}
              onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
              className="bg-cream rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="flat">Flat ₹ off</option>
              <option value="percent">% off</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder={newCoupon.type === 'flat' ? '₹ off' : '% off'}
              value={newCoupon.value}
              onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
              className="bg-cream rounded-lg px-3 py-2 text-sm outline-none"
            />
            <input
              type="number"
              placeholder="Min order ₹"
              value={newCoupon.minOrder}
              onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })}
              className="bg-cream rounded-lg px-3 py-2 text-sm outline-none"
            />
            {newCoupon.type === 'percent' && (
              <input
                type="number"
                placeholder="Max ₹ discount"
                value={newCoupon.maxDiscount}
                onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                className="bg-cream rounded-lg px-3 py-2 text-sm outline-none"
              />
            )}
          </div>
          <input
            placeholder="Label shown to customer (e.g. ₹20 OFF)"
            value={newCoupon.label}
            onChange={(e) => setNewCoupon({ ...newCoupon, label: e.target.value })}
            className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-primary text-white text-sm font-bold py-2.5 rounded-xl active:scale-95 transition disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Coupon'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-ink/40 py-16">
          <Loader2 size={18} className="animate-spin" /> Loading coupons...
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.length === 0 && <p className="text-center text-ink/40 py-16 text-sm">No coupons yet</p>}
          {coupons.map((coupon) => {
            const draft = getDraft(coupon)
            const isDirty = !!drafts[coupon.code]
            return (
              <div key={coupon.code} className="bg-white rounded-2xl shadow-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-display font-700 text-ink">{coupon.code}</p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-ink/60">
                    Active
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${
                        coupon.active ? 'bg-green-600' : 'bg-ink/15'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          coupon.active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                </div>
                <input
                  value={draft.label}
                  onChange={(e) => setDraftField(coupon.code, 'label', e.target.value)}
                  placeholder="Label"
                  className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={draft.type}
                    onChange={(e) => setDraftField(coupon.code, 'type', e.target.value)}
                    className="bg-cream rounded-lg px-2 py-2 text-xs outline-none"
                  >
                    <option value="flat">Flat ₹</option>
                    <option value="percent">%</option>
                  </select>
                  <input
                    type="number"
                    value={draft.value}
                    onChange={(e) => setDraftField(coupon.code, 'value', e.target.value)}
                    placeholder="Value"
                    className="bg-cream rounded-lg px-2 py-2 text-xs outline-none"
                  />
                  <input
                    type="number"
                    value={draft.min_order}
                    onChange={(e) => setDraftField(coupon.code, 'min_order', e.target.value)}
                    placeholder="Min order"
                    className="bg-cream rounded-lg px-2 py-2 text-xs outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  {isDirty && (
                    <button
                      onClick={() => handleSave(coupon.code)}
                      disabled={savingCode === coupon.code}
                      className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg active:scale-95 transition disabled:opacity-50"
                    >
                      <Save size={13} /> {savingCode === coupon.code ? 'Saving...' : 'Save'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(coupon.code)}
                    className="text-ink/30 active:text-red-500 transition p-2"
                    aria-label="Delete coupon"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
