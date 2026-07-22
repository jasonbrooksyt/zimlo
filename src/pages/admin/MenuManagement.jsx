import { useMemo, useState } from 'react'
import { Trash2, Plus, Save, Loader2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { useDishes } from '../../hooks/useDishes'
import { FOOD_SUBCATEGORIES } from '../../data/menuData'

// Full CRUD on the live `dishes` table. Every save/delete/insert here goes
// straight to Supabase, and useDishes' realtime subscription pushes the
// change out to every customer's open app within a second or two — no
// redeploy, no code edit.
export default function MenuManagement() {
  const { dishes, loading, error, refetch } = useDishes()
  const [expandedSub, setExpandedSub] = useState(FOOD_SUBCATEGORIES[0]?.id || null)
  const [drafts, setDrafts] = useState({}) // { dishId: { name, nameHi, price, veg, img } }
  const [savingId, setSavingId] = useState(null)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', message }
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDish, setNewDish] = useState({
    subcategory: FOOD_SUBCATEGORIES[0]?.id || '',
    name: '',
    nameHi: '',
    price: '',
    veg: true,
    img: '🍽️'
  })
  const [adding, setAdding] = useState(false)

  const dishesBySub = useMemo(() => {
    const map = {}
    FOOD_SUBCATEGORIES.forEach((sub) => {
      map[sub.id] = dishes.filter((d) => d.subcategory === sub.id)
    })
    return map
  }, [dishes])

  const getDraft = (dish) => drafts[dish.id] || dish

  const setDraftField = (dishId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [dishId]: { ...(prev[dishId] || dishes.find((d) => d.id === dishId)), [field]: value }
    }))
  }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (dishId) => {
    const draft = drafts[dishId]
    if (!draft) return
    if (!draft.name?.trim() || !draft.nameHi?.trim() || !draft.price) {
      showToast('error', 'Name, Hindi name and price are required')
      return
    }
    setSavingId(dishId)
    const { error: updateError } = await supabase
      .from('dishes')
      .update({
        name: draft.name.trim(),
        name_hi: draft.nameHi.trim(),
        price: Number(draft.price),
        veg: draft.veg,
        img: draft.img || '🍽️'
      })
      .eq('id', dishId)
    setSavingId(null)

    if (updateError) {
      showToast('error', updateError.message)
      return
    }
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[dishId]
      return next
    })
    showToast('success', 'Saved')
    refetch()
  }

  const handleDelete = async (dishId, dishName) => {
    if (!window.confirm(`Delete "${dishName}"? This can't be undone.`)) return
    const { error: deleteError } = await supabase.from('dishes').delete().eq('id', dishId)
    if (deleteError) {
      showToast('error', deleteError.message)
      return
    }
    showToast('success', 'Deleted')
    refetch()
  }

  const handleAddDish = async (e) => {
    e.preventDefault()
    if (!newDish.name.trim() || !newDish.nameHi.trim() || !newDish.price || !newDish.subcategory) {
      showToast('error', 'Fill in name, Hindi name, price and category')
      return
    }
    setAdding(true)
    const id = `${newDish.subcategory}-${Date.now()}`
    const { error: insertError } = await supabase.from('dishes').insert({
      id,
      subcategory: newDish.subcategory,
      name: newDish.name.trim(),
      name_hi: newDish.nameHi.trim(),
      price: Number(newDish.price),
      veg: newDish.veg,
      img: newDish.img || '🍽️'
    })
    setAdding(false)

    if (insertError) {
      showToast('error', insertError.message)
      return
    }
    setNewDish({ subcategory: newDish.subcategory, name: '', nameHi: '', price: '', veg: true, img: '🍽️' })
    setShowAddForm(false)
    showToast('success', 'Dish added')
    refetch()
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-sm text-amber-900">Supabase isn't connected yet</p>
            <p className="text-xs text-amber-800 mt-1">
              Menu editing needs a live database. Add VITE_SUPABASE_URL and
              VITE_SUPABASE_ANON_KEY (see .env.example / README) and redeploy, then this
              screen will let you edit prices and dishes for everyone in real time.
            </p>
          </div>
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
          <h2 className="font-display font-700 text-lg text-ink">Menu Management</h2>
          <p className="text-xs text-ink/50">{dishes.length} dishes live • edits sync instantly</p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-3 py-2 rounded-xl active:scale-95 transition"
        >
          <Plus size={16} /> Add Dish
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm font-medium mb-4">Failed to load menu: {error}</p>
      )}

      {/* Add new dish form */}
      {showAddForm && (
        <form onSubmit={handleAddDish} className="bg-white rounded-2xl shadow-card p-4 mb-5 space-y-3">
          <p className="font-semibold text-sm text-ink">New Dish</p>
          <select
            value={newDish.subcategory}
            onChange={(e) => setNewDish({ ...newDish, subcategory: e.target.value })}
            className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
          >
            {FOOD_SUBCATEGORIES.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Name (English)"
              value={newDish.name}
              onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
              className="bg-cream rounded-lg px-3 py-2 text-sm outline-none"
            />
            <input
              placeholder="नाम (Hindi)"
              value={newDish.nameHi}
              onChange={(e) => setNewDish({ ...newDish, nameHi: e.target.value })}
              className="bg-cream rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              min="1"
              placeholder="Price ₹"
              value={newDish.price}
              onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
              className="bg-cream rounded-lg px-3 py-2 text-sm outline-none"
            />
            <input
              placeholder="Emoji"
              value={newDish.img}
              onChange={(e) => setNewDish({ ...newDish, img: e.target.value })}
              className="bg-cream rounded-lg px-3 py-2 text-sm outline-none text-center"
            />
            <label className="flex items-center gap-2 bg-cream rounded-lg px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={newDish.veg}
                onChange={(e) => setNewDish({ ...newDish, veg: e.target.checked })}
              />
              Veg
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={adding}
              className="flex-1 bg-primary text-white text-sm font-bold py-2.5 rounded-xl active:scale-95 transition disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add Dish'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 text-sm font-semibold text-ink/60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-ink/40 py-16">
          <Loader2 size={18} className="animate-spin" /> Loading menu...
        </div>
      ) : (
        <div className="space-y-3">
          {FOOD_SUBCATEGORIES.map((sub) => {
            const subDishes = dishesBySub[sub.id] || []
            const isExpanded = expandedSub === sub.id
            return (
              <div key={sub.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <button
                  onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <span className="font-semibold text-sm text-ink">
                    {sub.name} <span className="text-ink/40 font-normal">({subDishes.length})</span>
                  </span>
                  {isExpanded ? <ChevronUp size={18} className="text-ink/40" /> : <ChevronDown size={18} className="text-ink/40" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-black/5 divide-y divide-black/5">
                    {subDishes.length === 0 && (
                      <p className="text-center text-ink/40 text-sm py-6">No dishes in this category yet</p>
                    )}
                    {subDishes.map((dish) => {
                      const draft = getDraft(dish)
                      const isDirty = !!drafts[dish.id]
                      return (
                        <div key={dish.id} className="p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              value={draft.img}
                              onChange={(e) => setDraftField(dish.id, 'img', e.target.value)}
                              className="w-10 h-10 shrink-0 text-center text-xl bg-cream rounded-lg outline-none"
                            />
                            <input
                              value={draft.name}
                              onChange={(e) => setDraftField(dish.id, 'name', e.target.value)}
                              placeholder="Name (English)"
                              className="flex-1 min-w-0 bg-cream rounded-lg px-3 py-2 text-sm outline-none font-medium"
                            />
                          </div>
                          <input
                            value={draft.nameHi}
                            onChange={(e) => setDraftField(dish.id, 'nameHi', e.target.value)}
                            placeholder="नाम (Hindi)"
                            className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-ink/50 text-sm shrink-0">₹</span>
                            <input
                              type="number"
                              min="1"
                              value={draft.price}
                              onChange={(e) => setDraftField(dish.id, 'price', e.target.value)}
                              className="w-24 bg-cream rounded-lg px-3 py-2 text-sm outline-none font-bold"
                            />
                            <label className="flex items-center gap-1.5 text-xs font-medium text-ink/70 shrink-0">
                              <input
                                type="checkbox"
                                checked={draft.veg}
                                onChange={(e) => setDraftField(dish.id, 'veg', e.target.checked)}
                              />
                              Veg
                            </label>
                            <div className="flex-1" />
                            {isDirty && (
                              <button
                                onClick={() => handleSave(dish.id)}
                                disabled={savingId === dish.id}
                                className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg active:scale-95 transition disabled:opacity-50"
                              >
                                <Save size={13} /> {savingId === dish.id ? 'Saving...' : 'Save'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(dish.id, dish.name)}
                              className="text-ink/30 active:text-red-500 transition p-2"
                              aria-label="Delete dish"
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
          })}
        </div>
      )}
    </div>
  )
}
