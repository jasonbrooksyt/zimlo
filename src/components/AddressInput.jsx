import { useState } from 'react'
import { MapPin, LocateFixed, Loader2, X, Check, Bookmark } from 'lucide-react'
import { useAddresses } from '../hooks/useAddresses'
import { useStore } from '../store/useStore'
import { fetchCurrentAddress } from '../lib/geolocation'
import {
  emptyAddressFields,
  addressPreview,
  rowToFields
} from '../lib/addressFormat'

const LABELS = ['Home', 'Work', 'Other']

/**
 * Structured address form used on Checkout, Request forms, etc.
 * value / onChange use: { fullName, addressLine, landmark, mobile }
 */
export default function AddressInput({ value, onChange }) {
  const language = useStore((s) => s.language)
  const user = useStore((s) => s.user)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  const { addresses, saveAddress, deleteAddress } = useAddresses()

  const fields = value && typeof value === 'object' ? value : emptyAddressFields({ addressLine: value || '', mobile: user?.phone || '' })

  const setField = (key, v) => {
    onChange({ ...fields, [key]: v })
  }

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
      onChange({ ...fields, addressLine: result.address })
      setCoords({ latitude: result.latitude, longitude: result.longitude })
      setSaved(false)
    } catch (err) {
      setLocateError(err.message)
    }
    setLocating(false)
  }

  const handleSaveWithLabel = async (label) => {
    const result = await saveAddress(fields, label, coords)
    setShowSavePrompt(false)
    if (result?.ok !== false) {
      setSaved(true)
    } else if (result?.error) {
      setLocateError(result.error)
    }
  }

  const alreadySaved = addresses.some(
    (a) =>
      (a.address_line || '').trim() === (fields.addressLine || '').trim() &&
      (a.full_name || '').trim() === (fields.fullName || '').trim()
  )

  const inputClass =
    'w-full bg-white rounded-2xl shadow-card px-4 py-3 outline-none text-sm text-ink placeholder:text-ink/30'

  return (
    <div className="space-y-2.5">
      {/* Saved address chips */}
      {addresses.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-1.5 bg-white border border-primary/25 rounded-full pl-3 pr-1.5 py-1.5 shrink-0 shadow-sm"
            >
              <button
                type="button"
                onClick={() => {
                  onChange(rowToFields(a))
                  setCoords(a.latitude ? { latitude: a.latitude, longitude: a.longitude } : null)
                  setSaved(true)
                }}
                className="flex items-center gap-1.5"
              >
                <MapPin size={13} className="text-primary shrink-0" />
                <span className="text-xs font-semibold text-ink whitespace-nowrap max-w-[160px] truncate">
                  {a.label}: {addressPreview(a)}
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteAddress(a.id)
                }}
                className="w-6 h-6 flex items-center justify-center rounded-full text-ink/35 active:text-red-500"
                aria-label="Remove saved address"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-ink/55 mb-1 block">
          {t('पूरा नाम', 'Full Name')}
        </label>
        <input
          type="text"
          value={fields.fullName}
          onChange={(e) => {
            setField('fullName', e.target.value)
            setSaved(false)
          }}
          placeholder={t('अपना पूरा नाम', 'Your full name')}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-ink/55 mb-1 block">
          {t('पता', 'Address')}
        </label>
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-primary text-xs font-semibold mb-1.5 active:opacity-70 disabled:opacity-50"
        >
          {locating ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
          {locating
            ? t('लोकेशन ले रहे हैं...', 'Getting location...')
            : t('मेरी मौजूदा लोकेशन इस्तेमाल करें', 'Use my current location')}
        </button>
        <textarea
          value={fields.addressLine}
          onChange={(e) => {
            setField('addressLine', e.target.value)
            setSaved(false)
            setShowSavePrompt(false)
          }}
          placeholder={t('घर नं., मोहल्ला, इलाका', 'House no., area, locality')}
          rows={2}
          required
          className={`${inputClass} resize-none`}
        />
        {locateError && (
          <p className="text-red-600 text-[11px] font-medium mt-1">{locateError}</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-ink/55 mb-1 block">
          {t('लैंडमार्क', 'Landmark')}{' '}
          <span className="font-normal text-ink/35">({t('वैकल्पिक', 'optional')})</span>
        </label>
        <input
          type="text"
          value={fields.landmark}
          onChange={(e) => {
            setField('landmark', e.target.value)
            setSaved(false)
          }}
          placeholder={t('पास की दुकान / मंदिर आदि', 'Nearby shop / temple etc.')}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-ink/55 mb-1 block">
          {t('मोबाइल नंबर', 'Mobile Number')}
        </label>
        <div className="flex items-center bg-white rounded-2xl shadow-card overflow-hidden">
          <span className="pl-4 text-sm font-semibold text-ink/50">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={fields.mobile}
            onChange={(e) => {
              setField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))
              setSaved(false)
            }}
            placeholder="10-digit number"
            required
            className="flex-1 px-3 py-3 outline-none text-sm text-ink placeholder:text-ink/30"
          />
        </div>
        {fields.mobile && !/^[6-9]\d{9}$/.test(fields.mobile) && (
          <p className="text-red-600 text-[11px] font-medium mt-1">
            {t('कृपया सही 10 अंकों का मोबाइल नंबर डालें', 'Please enter a valid 10-digit mobile number')}
          </p>
        )}
      </div>

      {/* Save for next time */}
      {fields.addressLine.trim() && fields.fullName.trim() && !alreadySaved && !saved && (
        <>
          {!showSavePrompt ? (
            <button
              type="button"
              onClick={() => setShowSavePrompt(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary/10 border border-primary/30 text-primary text-sm font-bold py-2.5 rounded-xl active:scale-[0.98] transition"
            >
              <Bookmark size={15} />
              {t('यह पता सेव करें', 'Save this address')}
            </button>
          ) : (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-ink/70 mb-2">
                {t('लेबल चुनें', 'Choose a label')}
              </p>
              <div className="flex gap-2">
                {LABELS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleSaveWithLabel(label)}
                    className="flex-1 py-2 rounded-lg bg-white border border-primary/25 text-xs font-bold text-primary active:bg-primary active:text-white transition"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowSavePrompt(false)}
                  className="px-2 text-ink/40"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {saved && (
        <p className="flex items-center gap-1 text-xs font-semibold text-green-600">
          <Check size={13} />
          {t('पता सेव हो गया', 'Address saved')}
        </p>
      )}
    </div>
  )
}
