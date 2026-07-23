import { useMemo, useRef, useState } from 'react'
import {
  Trash2, Plus, Save, Loader2, AlertTriangle, ChevronDown, ChevronUp,
  Camera, Pencil, X, FolderPlus
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { useDishes } from '../../hooks/useDishes'
import { useSubcategories } from '../../hooks/useSubcategories'
import { uploadDishImage } from '../../lib/uploadImage'

// Full CRUD on the live `dishes` and `subcategories` tables. Every
// save/delete/insert here goes straight to Supabase, and the realtime
// subscriptions in useDishes/useSubcategories push the change out to every
// customer's open app within a second or two — no redeploy, no code edit.
export default function MenuManagement() {
  const { dishes, loading, error, refetch } = useDishes()
  const { subcategories, refetch: refetchSubs } = useSubcategories()

  const [expandedSub, setExpandedSub] = useState(null)
  const [drafts, setDrafts] = useState({}) // { dishId: { name, nameHi, price, veg, img, description } }
  const [savingId, setSavingId] = useState(null)
  const [uploadingId, setUploadingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCategoryPanel, setShowCategoryPanel] = useState(false)
  const fileInputs = useRef({})

  const emptyNewDish = () => ({
    subcategory: subcategories[0]?.id || '',
    name: '',
    nameHi: '',
    price: '',
    veg: true,
    img: '🍽️',
    description: '',
    imageFile: null
  })
  const [newDish, setNewDish] = useState(emptyNewDish)
  const [adding, setAdding] = useState(false)

  // ---- Category management state ----
  const [catDrafts, setCatDrafts] = useState({}) // { catId: {name, nameHi, emoji, color} }
  const [newCategory, setNewCategory] = useState({ id: '', name: '', nameHi: '', emoji: '🍽️', color: '#FF9800' })
  const [addingCategory, setAddingCategory] = useState(false)

  const dishesBySub = useMemo(() => {
    const map = {}
    subcategories.forEach((sub) => {
      map[sub.id] = dishes.filter((d) => d.subcategory === sub.id)
    })
    return map
  }, [dishes, subcategories])

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

  // ---- Dish photo upload ----
  const handlePhotoChange = async (dishId, file) => {
    if (!file) return
    setUploadingId(dishId)
    const { url, error: uploadError } = await uploadDishImage(file, dishId)
    if (uploadError) {
      showToast('error', uploadError)
      setUploadingId(null)
      return
    }
    const { error: updateError } = await supabase.from('dishes').update({ image_url: url }).eq('id', dishId)
    setUploadingId(null)
    if (updateError) {
      showToast('error', updateError.message)
      return
    }
    showToast('success', 'Photo updated')
    refetch()
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
        img: draft.img || '🍽️',
        description: draft.description?.trim() || null
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

    let imageUrl = null
    if (newDish.imageFile) {
      const { url, error: uploadError } = await uploadDishImage(newDish.imageFile, id)
      if (uploadError) {
        showToast('error', uploadError)
        setAdding(false)
        return
      }
      imageUrl = url
    }

    const { error: insertError } = await supabase.from('dishes').insert({
      id,
      subcategory: newDish.subcategory,
      name: newDish.name.trim(),
      name_hi: newDish.nameHi.trim(),
      price: Number(newDish.price),
      veg: newDish.veg,
      img: newDish.img || '🍽️',
      description: newDish.description?.trim() || null,
      image_url: imageUrl
    })
    setAdding(false)

    if (insertError) {
      showToast('error', insertError.message)
      return
    }
    setNewDish(emptyNewDish())
    setShowAddForm(false)
    showToast('success', 'Dish added')
    refetch()
  }

  // ---- Category CRUD ----
  const getCatDraft = (cat) => catDrafts[cat.id] || cat
  const setCatDraftField = (catId, field, value) => {
    setCatDrafts((prev) => ({
      ...prev,
      [catId]: { ...(prev[catId] || subcategories.find((c) => c.id === catId)), [field]: value }
    }))
  }

  const handleSaveCategory = async (catId) => {
    const draft = catDrafts[catId]
    if (!draft) return
    const { error: updateError } = await supabase
      .from('subcategories')
      .update({ name: draft.name, name_hi: draft.nameHi, emoji: draft.emoji, color: draft.color })
      .eq('id', catId)
    if (updateError) {
      showToast('error', updateError.message)
      return
    }
    setCatDrafts((prev) => {
      const next = { ...prev }
      delete next[catId]
      return next
    })
    showToast('success', 'Category saved')
    refetchSubs()
  }

  const handleDeleteCategory = async (catId, catName) => {
    const dishCount = dishesBySub[catId]?.length || 0
    const confirmMsg =
      dishCount > 0
        ? `"${catName}" has ${dishCount} dishes. Delete the category anyway? Those dishes will stay but lose their category.`
        : `Delete category "${catName}"?`
    if (!window.confirm(confirmMsg)) return
    const { error: deleteError } = await supabase.from('subcategories').delete().eq('id', catId)
    if (deleteError) {
      showToast('error', deleteError.message)
      return
    }
    showToast('success', 'Category deleted')
    refetchSubs()
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    const id = newCategory.id.trim().toLowerCase().replace(/\s+/g, '-')
    if (!id || !newCategory.name.trim() || !newCategory.nameHi.trim()) {
      showToast('error', 'Fill in ID, name and Hindi name')
      return
    }
    setAddingCategory(true)
    const { error: insertError } = await supabase.from('subcategories').insert({
      id,
      name: newCategory.name.trim(),
      name_hi: newCategory.nameHi.trim(),
      emoji: newCategory.emoji || '🍽️',
      color: newCategory.color || '#FF9800',
      sort_order: subcategories.length + 1
    })
    setAddingCategory(false)
    if (insertError) {
      showToast('error', insertError.message)
      return
    }
    setNewCategory({ id: '', name: '', nameHi: '', emoji: '🍽️', color: '#FF9800' })
    showToast('success', 'Category added')
    refetchSubs()
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
              VITE_SUPABASE_ANON_KEY (see .env.example / README) and redeploy.
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

      {error && <p className="text-red-600 text-sm font-medium mb-4">Failed to load menu: {error}</p>}

      {/* ---- Category management ---- */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-5">
        <button
          onClick={() => setShowCategoryPanel((v) => !v)}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="flex items-center gap-2 font-semibold text-sm text-ink">
            <FolderPlus size={16} className="text-primary" /> Categories ({subcategories.length})
          </span>
          {showCategoryPanel ? <ChevronUp size={18} className="text-ink/40" /> : <ChevronDown size={18} className="text-ink/40" />}
        </button>

        {showCategoryPanel && (
          <div className="border-t border-black/5 p-3 space-y-2">
            {subcategories.map((cat) => {
              const draft = getCatDraft(cat)
              const isDirty = !!catDrafts[cat.id]
              return (
                <div key={cat.id} className="flex items-center gap-2 bg-cream rounded-xl p-2">
                  <input
                    value={draft.emoji}
                    onChange={(e) => setCatDraftField(cat.id, 'emoji', e.target.value)}
                    className="w-9 h-9 text-center text-lg bg-white rounded-lg outline-none shrink-0"
                  />
                  <input
                    value={draft.name}
                    onChange={(e) => setCatDraftField(cat.id, 'name', e.target.value)}
                    placeholder="Name"
                    className="flex-1 min-w-0 bg-white rounded-lg px-2 py-1.5 text-sm outline-none"
                  />
                  <input
                    value={draft.nameHi}
                    onChange={(e) => setCatDraftField(cat.id, 'nameHi', e.target.value)}
                    placeholder="नाम"
                    className="flex-1 min-w-0 bg-white rounded-lg px-2 py-1.5 text-sm outline-none"
                  />
                  {isDirty && (
                    <button
                      onClick={() => handleSaveCategory(cat.id)}
                      className="text-primary shrink-0 p-1.5"
                      aria-label="Save category"
                    >
                      <Save size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="text-ink/30 active:text-red-500 shrink-0 p-1.5"
                    aria-label="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}

            {/* Add new category */}
            <form onSubmit={handleAddCategory} className="flex items-center gap-2 bg-primary/5 rounded-xl p-2 mt-2">
              <input
                value={newCategory.emoji}
                onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                className="w-9 h-9 text-center text-lg bg-white rounded-lg outline-none shrink-0"
              />
              <input
                value={newCategory.id}
                onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                placeholder="id (e.g. shakes)"
                className="w-24 shrink-0 bg-white rounded-lg px-2 py-1.5 text-xs outline-none"
              />
              <input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Name"
                className="flex-1 min-w-0 bg-white rounded-lg px-2 py-1.5 text-sm outline-none"
              />
              <input
                value={newCategory.nameHi}
                onChange={(e) => setNewCategory({ ...newCategory, nameHi: e.target.value })}
                placeholder="नाम"
                className="flex-1 min-w-0 bg-white rounded-lg px-2 py-1.5 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={addingCategory}
                className="bg-primary text-white p-2 rounded-lg shrink-0 disabled:opacity-50"
                aria-label="Add category"
              >
                <Plus size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ---- Add new dish form ---- */}
      {showAddForm && (
        <form onSubmit={handleAddDish} className="bg-white rounded-2xl shadow-card p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-ink">New Dish</p>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-ink/40">
              <X size={18} />
            </button>
          </div>
          <select
            value={newDish.subcategory}
            onChange={(e) => setNewDish({ ...newDish, subcategory: e.target.value })}
            className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
          >
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Photo picker */}
          <label className="flex items-center gap-3 bg-cream rounded-lg px-3 py-2 cursor-pointer">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
              {newDish.imageFile ? (
                <img src={URL.createObjectURL(newDish.imageFile)} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera size={18} className="text-ink/30" />
              )}
            </div>
            <span className="text-sm text-ink/60">
              {newDish.imageFile ? newDish.imageFile.name : 'Upload photo (optional)'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setNewDish({ ...newDish, imageFile: e.target.files?.[0] || null })}
            />
          </label>

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
          <textarea
            placeholder="Short description (optional) — e.g. ingredients, spice level"
            value={newDish.description}
            onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
            rows={2}
            className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none resize-none"
          />
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
              placeholder="Emoji (fallback)"
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
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-primary text-white text-sm font-bold py-2.5 rounded-xl active:scale-95 transition disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Dish'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-ink/40 py-16">
          <Loader2 size={18} className="animate-spin" /> Loading menu...
        </div>
      ) : (
        <div className="space-y-3">
          {subcategories.map((sub) => {
            const subDishes = dishesBySub[sub.id] || []
            const isExpanded = expandedSub === sub.id
            return (
              <div key={sub.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <button
                  onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <span className="font-semibold text-sm text-ink">
                    {sub.emoji} {sub.name} <span className="text-ink/40 font-normal">({subDishes.length})</span>
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
                            {/* Photo upload */}
                            <button
                              type="button"
                              onClick={() => fileInputs.current[dish.id]?.click()}
                              className="relative w-14 h-14 shrink-0 rounded-lg bg-cream overflow-hidden flex items-center justify-center"
                            >
                              {uploadingId === dish.id ? (
                                <Loader2 size={16} className="animate-spin text-primary" />
                              ) : dish.imageUrl ? (
                                <img src={dish.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xl">{dish.img}</span>
                              )}
                              <span className="absolute bottom-0 right-0 bg-primary text-white rounded-tl-md p-0.5">
                                <Camera size={10} />
                              </span>
                            </button>
                            <input
                              ref={(el) => (fileInputs.current[dish.id] = el)}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoChange(dish.id, e.target.files?.[0])}
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
                          <textarea
                            value={draft.description || ''}
                            onChange={(e) => setDraftField(dish.id, 'description', e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                            className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-ink/50 text-sm shrink-0">₹</span>
                            <input
                              type="number"
                              min="1"
                              value={draft.price}
                              onChange={(e) => setDraftField(dish.id, 'price', e.target.value)}
                              className="w-20 bg-cream rounded-lg px-3 py-2 text-sm outline-none font-bold"
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
