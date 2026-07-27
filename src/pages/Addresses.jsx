import { useState } from 'react'
import { MapPin, Plus, Pencil, Trash2, LocateFixed, Loader2, X, Check } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useStore } from '../store/useStore'
import { useAddresses } from '../hooks/useAddresses'
import { fetchCurrentAddress } from '../lib/geolocation'

const LABELS = ['Home', 'Work', 'Other']

// Full "Manage Addresses" screen — add, edit, delete saved addresses
// directly (separate from the quick "save while ordering" flow in
// AddressInput). Reachable from Profile.
export default function Addresses() {
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  const { addresses, loading, saveAddress, updateAddress, deleteAddress } = useAddresses()

  const [editingId, setEditingId] = useState(null) // null | 'new' | address.id
  const [draftLabel, setDraftLabel] = useState('Home')
  const [draftText, setDraftText] = useState('')
  const [draftCoords, setDraftCoords] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')
  const [saving, setSaving] = useState(false)

  const startNew = () => {
    setEditingId('new')
    setDraftLabel('Home')
    setDraftText('')
    setDraftCoords(null)
    setLocateError('')
  }

  const startEdit = (address) => {
    setEditingId(address.id)
    setDraftLabel(address.label)
    setDraftText(address.address_line)
    setDraftCoords(address.latitude ? { latitude: address.latitude, longitude: address.longitude } : null)
    setLocateError('')
  }

  const cancelEdit = () => setEditingId(null)

  const handleUseLocation = async () => {
    setLocating(true)
    setLocateError('')
    try {
      const result = await fetchCurrentAddress()
      setDraftText(result.address)
      setDraftCoords({ latitude: result.latitude, longitude: result.longitude })
    } catch (err) {
      setLocateError(err.message)
    }
    setLocating(false)
  }

  const handleSave = async () => {
    if (!draftText.trim()) return
    setSaving(true)
    if (editingId === 'new') {
      await saveAddress(draftText, draftLabel, draftCoords)
    } else {
      await updateAddress(editingId, {
        label: draftLabel,
        addressText: draftText,
        latitude: draftCoords?.latitude,
        longitude: draftCoords?.longitude
      })
    }
    setSaving(false)
    setEditingId(null)
  }

  const isEditing = editingId !== null

  return (
    <div className="app-shell pb-24">
      <Header back title="My Addresses" titleHi="मेरे पते" />

      <div className="px-4 pt-2">
        {!isEditing && (
          <button
            onClick={startNew}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-2xl shadow-pop active:scale-[0.98] transition mb-4"
          >
            <Plus size={18} />
            {t('नया पता जोड़ें', 'Add New Address')}
          </button>
        )}

        {isEditing && (
          <div className="bg-white rounded-2xl shadow-card p-4 mb-4 space-y-3">
            <div className="flex items-center gap-2">
              {LABELS.map((label) => (
                <button
                  key={label}
                  onClick={() => setDraftLabel(label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    draftLabel === label ? 'bg-primary text-white' : 'bg-cream text-ink/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locating}
              className="flex items-center gap-1.5 text-primary text-xs font-bold disabled:opacity-50"
            >
              {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
              {locating ? t('लोकेशन ढूंढ रहे हैं...', 'Finding your location...') : t('मौजूदा लोकेशन इस्तेमाल करें', 'Use my current location')}
            </button>
            {locateError && <p className="text-red-500 text-xs">{locateError}</p>}

            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder={t('पूरा पता लिखें', 'Full address')}
              rows={3}
              className="w-full bg-cream rounded-xl p-3 outline-none text-sm text-ink placeholder:text-ink/30 resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!draftText.trim() || saving}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white font-bold py-2.5 rounded-xl active:scale-95 transition disabled:opacity-50"
              >
                <Check size={16} /> {saving ? t('सेव हो रहा है...', 'Saving...') : t('सेव करें', 'Save')}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 flex items-center justify-center gap-1 text-ink/60 font-semibold text-sm"
              >
                <X size={16} /> {t('रद्द करें', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-ink/40 py-16">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{t('लोड हो रहा है...', 'Loading...')}</span>
          </div>
        ) : addresses.length === 0 && !isEditing ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin size={48} className="text-ink/20 mb-3" />
            <p className="text-ink/50 text-sm">{t('कोई पता सेव नहीं है', 'No saved addresses yet')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((a) => (
              <div key={a.id} className="flex items-start gap-3 bg-white rounded-2xl shadow-card p-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink">{a.label}</p>
                  <p className="text-xs text-ink/60 mt-0.5 leading-relaxed">{a.address_line}</p>
                </div>
                <button onClick={() => startEdit(a)} className="text-ink/40 p-1.5 shrink-0" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteAddress(a.id)}
                  className="text-ink/40 active:text-red-500 p-1.5 shrink-0"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
