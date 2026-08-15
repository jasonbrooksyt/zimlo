import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle2, Camera, X, Loader2, Phone, Clock } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import AddressInput from '../components/AddressInput'
import { emptyAddressFields, isAddressComplete, formatAddressBlock } from '../lib/addressFormat'
import { CATEGORIES, SERVICE_TYPES } from '../data/menuData'
import { useStore } from '../store/useStore'
import { uploadAttachment } from '../lib/uploadAttachment'
import { isStoreOpen } from '../lib/storeHours'

const SERVICE_IDS = new Set(
  SERVICE_TYPES.flatMap((s) => [s.id, ...((s.children || []).map((c) => c.id))])
)

const PREFERRED_TIMES = [
  { id: 'anytime', label: 'Anytime', labelHi: 'कभी भी' },
  { id: 'morning', label: 'Morning (9 AM – 12 PM)', labelHi: 'सुबह (9 – 12 बजे)' },
  { id: 'afternoon', label: 'Afternoon (12 – 4 PM)', labelHi: 'दोपहर (12 – 4 बजे)' },
  { id: 'evening', label: 'Evening (4 – 8 PM)', labelHi: 'शाम (4 – 8 बजे)' }
]

export default function RequestForm() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const language = useStore((s) => s.language)
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const placeRequestOrder = useStore((s) => s.placeRequestOrder)
  const pendingRequestDraft = useStore((s) => s.pendingRequestDraft)
  const setPendingRequestDraft = useStore((s) => s.setPendingRequestDraft)
  const clearPendingRequestDraft = useStore((s) => s.clearPendingRequestDraft)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const isService = SERVICE_IDS.has(categoryId)
  const category =
    CATEGORIES.find((c) => c.id === categoryId) ||
    SERVICE_TYPES.find((c) => c.id === categoryId) ||
    SERVICE_TYPES.flatMap((s) => s.children || []).find((c) => c.id === categoryId)

  const [requirement, setRequirement] = useState('')
  const [addressFields, setAddressFields] = useState(() => emptyAddressFields({ mobile: '' }))
  const [paymentPref, setPaymentPref] = useState('cod')
  const [preferredTime, setPreferredTime] = useState('anytime')
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [attachmentPreview, setAttachmentPreview] = useState(null)
  const [attachmentUrl, setAttachmentUrl] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const autoSubmitted = useRef(false)

  const placeholderMap = {
    bakery: t('जैसे: 1 किलो चॉकलेट केक, कल शाम 5 बजे तक चाहिए', 'e.g. 1kg chocolate cake, needed by 5 PM tomorrow'),
    grocery: t('जैसे: 1 किलो चावल, आटा 5 किलो, तेल 1 लीटर, चीनी 1 किलो', 'e.g. 1kg rice, 5kg atta, 1L oil, 1kg sugar'),
    parcel: t('जैसे: पिकअप - सिविल लाइन्स, ड्रॉप - स्टेशन रोड, एक लिफाफा', 'e.g. Pickup - Civil Lines, Drop - Station Road, one envelope'),
    custom: t('अपनी ज़रूरत विस्तार से लिखें...', 'Describe exactly what you need...'),
    tiffin: t('जैसे: रोज़ाना लंच टिफिन, 2 लोगों के लिए, शाकाहारी', 'e.g. daily lunch tiffin for 2 people, vegetarian'),
    plumber: t('जैसे: किचन का नल लीक हो रहा है, आज शाम तक', 'e.g. kitchen tap is leaking, needed by this evening'),
    electrician: t('जैसे: पंखा नहीं चल रहा, वायरिंग चेक करनी है', 'e.g. ceiling fan not working, need wiring check'),
    carpenter: t('जैसे: लकड़ी का दरवाज़ा ठीक करना है', 'e.g. wooden door needs repair'),
    technician: t('जैसे: उपकरण खराब है', 'e.g. appliance not working'),
    'technician-tv': t('जैसे: टीवी नहीं खुल रहा / स्क्रीन काली', 'e.g. TV not turning on / black screen'),
    'technician-fridge': t('जैसे: फ्रिज ठंडा नहीं कर रहा', 'e.g. fridge not cooling'),
    'technician-washing-machine': t('जैसे: मशीन घूम नहीं रही / पानी लीक', 'e.g. machine not spinning / water leak'),
    'technician-induction': t('जैसे: इंडक्शन हीट नहीं हो रहा', 'e.g. induction not heating'),
    'technician-cooler': t('जैसे: कूलर का पंप / पंखा बंद', 'e.g. cooler pump / fan not working'),
    transport: t('जैसे: टेम्पो या कार बुकिंग', 'e.g. tempo or car booking'),
    'transport-tempo': t('जैसे: सामान शिफ्ट करना — कुरावर से पिलुखेड़ी', 'e.g. shift goods — Kurawar to Pilukhedi'),
    'transport-car': t('जैसे: 4 सीटर कार, कल सुबह स्टेशन', 'e.g. 4-seater car, tomorrow morning to station'),
    'other-service': t('अपनी सेवा की ज़रूरत विस्तार से लिखें...', 'Describe the service you need in detail...')
  }

  const attachmentLabelMap = {
    bakery: t('फोटो अटैच करें (केक डिज़ाइन, आदि)', 'Attach a photo (cake design reference, etc.)'),
    grocery: t('लिस्ट की फोटो अटैच करें', 'Attach a photo of your list'),
    parcel: t('सामान की फोटो अटैच करें', 'Attach a photo of the item'),
    custom: t('रेफरेंस फोटो अटैच करें', 'Attach a reference photo'),
    tiffin: t('मेनू / रेफरेंस फोटो (वैकल्पिक)', 'Menu / reference photo (optional)'),
    plumber: t('समस्या की फोटो अटैच करें', 'Attach a photo of the problem'),
    electrician: t('समस्या की फोटो अटैच करें', 'Attach a photo of the problem'),
    carpenter: t('काम / फर्नीचर की फोटो', 'Photo of work / furniture'),
    fabrication: t('डिज़ाइन / जगह की फोटो', 'Design / site photo'),
    mechanic: t('वाहन / समस्या की फोटो', 'Vehicle / problem photo'),
    transport: t('सामान की फोटो (वैकल्पिक)', 'Goods photo (optional)'),
    'other-service': t('रेफरेंस फोटो अटैच करें', 'Attach a reference photo')
  }

  const buildRequirement = (req, timeId) => {
    if (!isService) return req.trim()
    const time = PREFERRED_TIMES.find((x) => x.id === timeId)
    const timeLabel = time ? (language === 'hi' ? time.labelHi : time.label) : timeId
    return `${req.trim()}\n\n[${t('पसंदीदा समय', 'Preferred time')}: ${timeLabel}]`
  }

  const submitOrder = async (requirementVal, addressVal, paymentPrefVal, attachmentUrlVal, timeId) => {
    setSubmitting(true)
    setSubmitError('')
    const result = await placeRequestOrder({
      category: categoryId,
      requirement: buildRequirement(requirementVal, timeId || preferredTime),
      address: addressVal.trim(),
      paymentMethodPreference: isService ? 'enquiry' : paymentPrefVal,
      attachmentUrl: attachmentUrlVal,
      customerPhone: addressFields.mobile || undefined
    })
    setSubmitting(false)
    // placeRequestOrder returns the order on success, or { error: '...' } on failure
    if (result && result.id) {
      setSubmitted(result)
    } else {
      const detail = result?.error || ''
      setSubmitError(
        (detail
          ? `${t('भेजने में समस्या हुई', 'Could not submit')}: ${detail}`
          : t(
              'भेजने में समस्या हुई — कृपया दोबारा कोशिश करें',
              'Could not submit your request — please try again'
            ))
      )
    }
  }

  useEffect(() => {
    if (
      pendingRequestDraft &&
      pendingRequestDraft.categoryId === categoryId &&
      isAuthenticated &&
      !autoSubmitted.current
    ) {
      autoSubmitted.current = true
      setRequirement(pendingRequestDraft.requirement)
      if (pendingRequestDraft.addressFields) {
        setAddressFields(pendingRequestDraft.addressFields)
      } else if (typeof pendingRequestDraft.address === 'string') {
        setAddressFields(emptyAddressFields({ addressLine: pendingRequestDraft.address }))
      }
      if (pendingRequestDraft.paymentPref) setPaymentPref(pendingRequestDraft.paymentPref)
      if (pendingRequestDraft.preferredTime) setPreferredTime(pendingRequestDraft.preferredTime)
      clearPendingRequestDraft()
      submitOrder(
        pendingRequestDraft.requirement,
        pendingRequestDraft.addressFields
          ? formatAddressBlock(pendingRequestDraft.addressFields, language)
          : pendingRequestDraft.address,
        pendingRequestDraft.paymentPref || 'cod',
        pendingRequestDraft.attachmentUrl,
        pendingRequestDraft.preferredTime || 'anytime'
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRequestDraft, isAuthenticated, categoryId])

  const handleAttachmentChange = async (file) => {
    if (!file) return
    setAttachmentFile(file)
    setAttachmentPreview(URL.createObjectURL(file))
    setUploadingPhoto(true)
    const { url } = await uploadAttachment(file)
    setAttachmentUrl(url)
    setUploadingPhoto(false)
  }

  const removeAttachment = () => {
    setAttachmentFile(null)
    setAttachmentPreview(null)
    setAttachmentUrl(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!requirement.trim() || !isAddressComplete(addressFields) || submitting || uploadingPhoto) return
    if (!isStoreOpen()) {
      alert(t('स्टोर अभी बंद है — कृपया खुलने के बाद अनुरोध भेजें', 'Store is closed — please submit after we open'))
      return
    }

    const addressBlock = formatAddressBlock(addressFields, language)
    const phone = (addressFields.mobile || '').trim()

    if (!isAuthenticated) {
      setPendingRequestDraft({
        categoryId,
        requirement: requirement.trim(),
        address: addressBlock,
        addressFields,
        paymentPref: isService ? 'enquiry' : paymentPref,
        preferredTime,
        attachmentUrl
      })
      navigate('/login', { state: { from: location } })
      return
    }

    submitOrder(requirement, addressBlock, paymentPref, attachmentUrl, preferredTime)
  }

  if (submitted) {
    return (
      <div className="app-shell pb-28 flex flex-col items-center justify-center px-6 min-h-screen text-center">
        <CheckCircle2 size={64} className="text-green-600 mb-4" />
        <h2 className="font-display font-700 text-xl text-ink mb-2">
          {isService
            ? t('Enquiry भेज दी गई!', 'Enquiry sent!')
            : t('आपका रिक्वेस्ट भेज दिया गया!', 'Your request has been sent!')}
        </h2>
        <p className="text-ink/60 text-sm mb-1">
          {t('रेफरेंस आईडी', 'Reference ID')}:{' '}
          <span className="font-semibold text-ink">{submitted.id}</span>
        </p>
        <p className="text-ink/60 text-sm mb-6 leading-relaxed">
          {t(
            'आपका रिक्वेस्ट सफलतापूर्वक सबमिट हो गया। हमारी टीम जल्द ही आपसे संपर्क करेगी।',
            'Your request submitted successfully. Our team will contact you shortly.'
          )}
        </p>
        <button
          onClick={() => navigate(`/track/${submitted.id}`)}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition mb-3"
        >
          {isService ? t('स्टेटस देखें', 'View status') : t('ऑर्डर ट्रैक करें', 'Track Order')}
        </button>
        <button
          onClick={() => navigate('/home')}
          className="w-full text-ink/60 font-medium text-sm py-2"
        >
          {t('होम पर जाएं', 'Back to Home')}
        </button>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="app-shell px-6 py-20 text-center">
        <p className="text-ink/50">{t('कैटेगरी नहीं मिली', 'Category not found')}</p>
        <button onClick={() => navigate('/home')} className="text-primary font-bold mt-4">
          {t('होम', 'Home')}
        </button>
      </div>
    )
  }

  return (
    <div className="app-shell pb-10">
      <Header back title={category?.name} titleHi={category?.nameHi} />

      <form onSubmit={handleSubmit} className="px-4 pt-2 space-y-5">
        <div
          className="bg-white rounded-2xl shadow-card p-4 border-l-4"
          style={{ borderColor: category?.color || '#FF9800' }}
        >
          <p className="text-xs text-ink/60 leading-relaxed">
            {isService
              ? t(
                  'यह एक enquiry है — कीमत पहले से तय नहीं। अपनी ज़रूरत लिखें, टीम कॉल करके डिटेल्स और रेट बताएगी।',
                  'This is an enquiry — pricing is confirmed after review. Describe what you need; our team will call to confirm details and rates.'
                )
              : t(
                  'इस कैटेगरी में कीमत पहले से तय नहीं है। अपनी ज़रूरत लिखें, हमारी टीम कीमत तय करके आपको बताएगी।',
                  'This category has no fixed pricing. Describe what you need, and our team will confirm the price with you.'
                )}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {isService
              ? t('क्या काम करवाना है?', 'What do you need done?')
              : t('अपनी ज़रूरत लिखें', 'Describe your requirement')}
          </label>
          <textarea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder={placeholderMap[categoryId] || ''}
            rows={5}
            required
            className="w-full bg-white rounded-2xl shadow-card p-4 outline-none text-sm text-ink placeholder:text-ink/30 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {attachmentLabelMap[categoryId] || t('फोटो अटैच करें (वैकल्पिक)', 'Attach a photo (optional)')}
          </label>
          {attachmentPreview ? (
            <div className="relative w-28 h-28">
              <img
                src={attachmentPreview}
                alt=""
                className="w-full h-full object-cover rounded-2xl shadow-card"
              />
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <Loader2 size={22} className="text-white animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={removeAttachment}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-card flex items-center justify-center"
                aria-label="Remove photo"
              >
                <X size={14} className="text-ink" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-3 bg-white rounded-2xl shadow-card p-4 cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-cream flex items-center justify-center shrink-0">
                <Camera size={20} className="text-ink/40" />
              </div>
              <span className="text-sm text-ink/50">{t('फोटो चुनें', 'Choose a photo')}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAttachmentChange(e.target.files?.[0])}
              />
            </label>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {isService
              ? t('लोकेशन / पता', 'Location / Address')
              : t('डिलीवरी पता', 'Delivery Address')}
          </label>
          <AddressInput value={addressFields} onChange={setAddressFields} />
        </div>

        {/* Services → preferred contact time (enquiry) | Others → payment */}
        {isService ? (
          <div>
            <label className="text-sm font-semibold text-ink/70 mb-1.5 block flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              {t('कॉल के लिए पसंदीदा समय', 'Preferred time for a call')}
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {PREFERRED_TIMES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreferredTime(opt.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl font-medium text-xs border transition ${
                    preferredTime === opt.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-black/10 bg-white text-ink/70'
                  }`}
                >
                  {language === 'hi' ? opt.labelHi : opt.label}
                </button>
              ))}
            </div>
            <p className="flex items-start gap-1.5 text-[11px] text-ink/45 mt-2.5 leading-relaxed">
              <Phone size={12} className="shrink-0 mt-0.5 text-primary" />
              {t(
                'कोई ऑनलाइन भुगतान नहीं — पहले enquiry, फिर टीम रेट बताएगी।',
                'No online payment here — send an enquiry first; our team will share the rate.'
              )}
            </p>
          </div>
        ) : (
          <div>
            <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
              {t('भुगतान पसंद', 'Payment Preference')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentPref('cod')}
                className={`py-3 rounded-2xl font-semibold text-sm border-2 transition ${
                  paymentPref === 'cod'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-black/10 bg-white text-ink/60'
                }`}
              >
                {t('कैश ऑन डिलीवरी', 'Cash on Delivery')}
                <span className="block text-[10px] font-normal mt-0.5">
                  +₹20 {t('सुविधा शुल्क', 'convenience fee')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentPref('online')}
                className={`py-3 rounded-2xl font-semibold text-sm border-2 transition ${
                  paymentPref === 'online'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-black/10 bg-white text-ink/60'
                }`}
              >
                {t('ऑनलाइन भुगतान', 'Pay Online')}
                <span className="block text-[10px] font-normal mt-0.5">
                  {t('अतिरिक्त शुल्क नहीं', 'no extra fee')}
                </span>
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || uploadingPhoto}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition disabled:opacity-50"
        >
          {submitting
            ? t('भेजा जा रहा है...', 'Submitting...')
            : uploadingPhoto
              ? t('फोटो अपलोड हो रही है...', 'Uploading photo...')
              : isService
                ? t('Enquiry भेजें', 'Send Enquiry')
                : t('रिक्वेस्ट भेजें', 'Submit Request')}
        </button>
        {submitError && (
          <p className="text-red-600 text-sm font-medium text-center">{submitError}</p>
        )}
      </form>

      <BottomNav />
    </div>
  )
}
