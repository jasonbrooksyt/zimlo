import { useState } from 'react'
import { MapPin, LocateFixed, Loader2, X, Check, Bookmark } from 'lucide-react'
import { useAddresses } from '../hooks/useAddresses'
import { useStore } from '../store/useStore'
import { fetchCurrentAddress } from '../lib/geolocation'

const LABELS = ['Home', 'Work', 'Other']

// Full address entry widget used on Checkout and Request forms:
// - Saved address chips (tap to fill the textarea)
// - "Use my current location" (GPS -> reverse geocoded address)
// - Free-text textarea, always editable
// - "Save this address" — stores it (with GPS coords if used) for next time
export default function AddressInput({ value, onChange }) {
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  const { addresses, saveAddress, deleteAddress } = useAddresses()

  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')
  const [coords, setCoords] = useState(null)
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleUseLocation = async () => {
    setLocating(true)
    setLocateError('')
    try {
      const result = await fetchCurrentAddress()
      onChange(result.address)
      setCoords({ latitude: result.latitude, longitude: result.longitude })
      setSaved(false)
    } catch (err) {
      setLocateError(err.message)
    }
    setLocating(false)
  }

  const handleSaveWithLabel = async (label) => {
    await saveAddress(value, label, coords)
    setShowSavePrompt(false)
    setSaved(true)
  }

  const alreadySaved = addresses.some((a) => a.address_line.trim() === value.trim())

  return (
    <div>
      {/* Saved address chips */}
      {addresses.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-1.5 bg-white border border-primary/20 rounded-full pl-3 pr-1.5 py-1.5 shrink-0"
            >
              <button
                onClick={() => {
                  onChange(a.address_line)
                  setCoords(a.latitude ? { latitude: a.latitude, longitude: a.longitude } : null)
                  setSaved(true)
                }}
                className="flex items-center gap-1.5"
              >
                <MapPin size={13} className="text-primary shrink-0" />
                <span className="text-xs font-semibold text-ink whitespace-nowrap max-w-[150px] truncate">
                  {a.label}: {a.address_line}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteAddress(a.id)
                }}
                aria-label="Delete saved address"
                className="text-ink/30 active:text-red-500 p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* GPS button */}
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={locating}
        className="flex items-center gap-1.5 text-primary text-xs font-bold mb-2 disabled:opacity-50"
      >
        {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
        {locating ? t('लोकेशन ढूंढ रहे हैं...', 'Finding your location...') : t('मौजूदा लोकेशन इस्तेमाल करें', 'Use my current location')}
      </button>
      {locateError && <p className="text-red-500 text-xs mb-2">{locateError}</p>}

      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setSaved(false)
        }}
        placeholder={t('पूरा पता लिखें (घर नं., मोहल्ला, लैंडमार्क)', 'Full address (house no., area, landmark)')}
        rows={2}
        required
        className="w-full bg-white rounded-2xl shadow-card p-4 outline-none text-sm text-ink placeholder:text-ink/30 resize-none"
      />

      {/* Save this address */}
      {value.trim() && !alreadySaved && !saved && (
        <>
          {!showSavePrompt ? (
            <button
              type="button"
              onClick={() => setShowSavePrompt(true)}
              className="flex items-center gap-1.5 text-ink/50 text-xs font-semibold mt-2"
            >
              <Bookmark size={13} />
              {t('इस पते को सेव करें', 'Save this address for next time')}
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-ink/50">{t('किस रूप में?', 'Save as:')}</span>
              {LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSaveWithLabel(label)}
                  className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full active:scale-95 transition"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {saved && (
        <p className="flex items-center gap-1 text-green-600 text-xs font-semibold mt-2">
          <Check size={13} /> {t('सेव हो गया', 'Saved')}
        </p>
      )}
    </div>
  )
}
