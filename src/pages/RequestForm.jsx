import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle2, Camera, X, Loader2 } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import AddressInput from '../components/AddressInput'
import { CATEGORIES } from '../data/menuData'
import { useStore } from '../store/useStore'
import { uploadAttachment } from '../lib/uploadAttachment'

// Used for every category where the customer writes their requirement in
// free text and Zimlo's admin manually sets the price afterwards:
// Bakery, Grocery, Medicine, Parcel, Custom Order.
//
// Filling this form is free, no login required — matches Food's "browse
// free, login only to place the order" flow. Login is only requested at
// Submit time; the filled-in fields are stashed in the store first, so
// after OTP login the customer lands right back here with everything
// intact and the request submits automatically. Photo attachments (e.g. a
// prescription, a reference picture, a handwritten list) upload before
// that redirect happens, so the URL survives the trip too.
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

  const category = CATEGORIES.find((c) => c.id === categoryId)

  const [requirement, setRequirement] = useState('')
  const [address, setAddress] = useState('')
  const [paymentPref, setPaymentPref] = useState('cod')
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [attachmentPreview, setAttachmentPreview] = useState(null)
  const [attachmentUrl, setAttachmentUrl] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const autoSubmitted = useRef(false)

  const placeholderMap = {
    bakery: t('जैसे: 1 किलो चॉकलेट केक, कल शाम 5 बजे तक चाहिए', 'e.g. 1kg chocolate cake, needed by 5 PM tomorrow'),
    grocery: t('जैसे: 1 किलो चावल, आटा 5 किलो, तेल 1 लीटर, चीनी 1 किलो', 'e.g. 1kg rice, 5kg atta, 1L oil, 1kg sugar'),
    medicine: t('जैसे: पैरासिटामोल 10 गोली — नीचे पर्ची की फोटो भी लगा सकते हैं', 'e.g. Paracetamol strip of 10 — you can attach a prescription photo below too'),
    parcel: t('जैसे: पिकअप - सिविल लाइन्स, ड्रॉप - स्टेशन रोड, एक लिफाफा', 'e.g. Pickup - Civil Lines, Drop - Station Road, one envelope'),
    custom: t('अपनी ज़रूरत विस्तार से लिखें...', 'Describe exactly what you need...')
  }

  const attachmentLabelMap = {
    bakery: t('फोटो अटैच करें (केक डिज़ाइन, आदि)', 'Attach a photo (cake design reference, etc.)'),
    grocery: t('लिस्ट की फोटो अटैच करें', 'Attach a photo of your list'),
    medicine: t('पर्ची की फोटो अटैच करें', 'Attach prescription photo'),
    parcel: t('सामान की फोटो अटैच करें', 'Attach a photo of the item'),
    custom: t('रेफरेंस फोटो अटैच करें', 'Attach a reference photo')
  }

  // Submits to Supabase — shared by the normal submit button and the
  // auto-submit-after-login path below.
  const submitOrder = async (requirementVal, addressVal, paymentPrefVal, attachmentUrlVal) => {
    setSubmitting(true)
    const order = await placeRequestOrder({
      category: categoryId,
      requirement: requirementVal.trim(),
      address: addressVal.trim(),
      paymentMethodPreference: paymentPrefVal,
      attachmentUrl: attachmentUrlVal
    })
    setSubmitting(false)
    if (order) setSubmitted(order)
  }

  // On landing here fresh from login, restore a matching pending draft and
  // finish the submission the customer already asked for.
  useEffect(() => {
    if (
      pendingRequestDraft &&
      pendingRequestDraft.categoryId === categoryId &&
      isAuthenticated &&
      !autoSubmitted.current
    ) {
      autoSubmitted.current = true
      setRequirement(pendingRequestDraft.requirement)
      setAddress(pendingRequestDraft.address)
      setPaymentPref(pendingRequestDraft.paymentPref)
      clearPendingRequestDraft()
      submitOrder(
        pendingRequestDraft.requirement,
        pendingRequestDraft.address,
        pendingRequestDraft.paymentPref,
        pendingRequestDraft.attachmentUrl
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
    if (!requirement.trim() || !address.trim() || submitting || uploadingPhoto) return

    if (!isAuthenticated) {
      // Save what they've written (including any uploaded photo's URL),
      // then send them to login — Login.jsx brings them straight back.
      setPendingRequestDraft({
        categoryId,
        requirement: requirement.trim(),
        address: address.trim(),
        paymentPref,
        attachmentUrl
      })
      navigate('/login', { state: { from: location } })
      return
    }

    submitOrder(requirement, address, paymentPref, attachmentUrl)
  }

  if (submitted) {
    return (
      <div className="app-shell pb-28 flex flex-col items-center justify-center px-6 min-h-screen text-center">
        <CheckCircle2 size={64} className="text-green-600 mb-4" />
        <h2 className="font-display font-700 text-xl text-ink mb-2">
          {t('आपका रिक्वेस्ट भेज दिया गया!', 'Your request has been sent!')}
        </h2>
        <p className="text-ink/60 text-sm mb-1">
          {t('ऑर्डर आईडी', 'Order ID')}: <span className="font-semibold text-ink">{submitted.id}</span>
        </p>
        <p className="text-ink/60 text-sm mb-6">
          {t(
            'हमारी टीम जल्द ही कीमत तय करके आपको सूचित करेगी।',
            "Our team will review it and confirm the price shortly."
          )}
        </p>
        <button
          onClick={() => navigate(`/track/${submitted.id}`)}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition mb-3"
        >
          {t('ऑर्डर ट्रैक करें', 'Track Order')}
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

  return (
    <div className="app-shell pb-10">
      <Header back title={category?.name} titleHi={category?.nameHi} />

      <form onSubmit={handleSubmit} className="px-4 pt-2 space-y-5">
        <div className="bg-white rounded-2xl shadow-card p-4 border-l-4" style={{ borderColor: category?.color }}>
          <p className="text-xs text-ink/60 leading-relaxed">
            {t(
              'इस कैटेगरी में कीमत पहले से तय नहीं है। अपनी ज़रूरत लिखें, हमारी टीम कीमत तय करके आपको बताएगी।',
              'This category has no fixed pricing. Describe what you need, and our team will confirm the price with you.'
            )}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {t('अपनी ज़रूरत लिखें', 'Describe your requirement')}
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

        {/* Photo attachment — prescription / reference / list photo */}
        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {attachmentLabelMap[categoryId] || t('फोटो अटैच करें (वैकल्पिक)', 'Attach a photo (optional)')}
          </label>
          {attachmentPreview ? (
            <div className="relative w-28 h-28">
              <img src={attachmentPreview} alt="" className="w-full h-full object-cover rounded-2xl shadow-card" />
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
            {t('डिलीवरी पता', 'Delivery Address')}
          </label>
          <AddressInput value={address} onChange={setAddress} />
        </div>

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {t('भुगतान पसंद', 'Payment Preference')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentPref('cod')}
              className={`py-3 rounded-2xl font-semibold text-sm border-2 transition ${
                paymentPref === 'cod' ? 'border-primary bg-primary/10 text-primary' : 'border-black/10 bg-white text-ink/60'
              }`}
            >
              {t('कैश ऑन डिलीवरी', 'Cash on Delivery')}
              <span className="block text-[10px] font-normal mt-0.5">+₹20 {t('सुविधा शुल्क', 'convenience fee')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentPref('online')}
              className={`py-3 rounded-2xl font-semibold text-sm border-2 transition ${
                paymentPref === 'online' ? 'border-primary bg-primary/10 text-primary' : 'border-black/10 bg-white text-ink/60'
              }`}
            >
              {t('ऑनलाइन भुगतान', 'Pay Online')}
              <span className="block text-[10px] font-normal mt-0.5">{t('अतिरिक्त शुल्क नहीं', 'no extra fee')}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || uploadingPhoto}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition disabled:opacity-50"
        >
          {submitting
            ? t('भेजा जा रहा है...', 'Submitting...')
            : uploadingPhoto
            ? t('फोटो अपलोड हो रही है...', 'Uploading photo...')
            : t('रिक्वेस्ट भेजें', 'Submit Request')}
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
