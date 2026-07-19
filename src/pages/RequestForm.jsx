import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { CATEGORIES } from '../data/menuData'
import { useStore } from '../store/useStore'

// Used for every category where the customer writes their requirement in
// free text and Zimlo's admin manually sets the price afterwards:
// Bakery, Grocery, Medicine, Parcel, Custom Order.
export default function RequestForm() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const placeRequestOrder = useStore((s) => s.placeRequestOrder)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const category = CATEGORIES.find((c) => c.id === categoryId)

  const [requirement, setRequirement] = useState('')
  const [address, setAddress] = useState('')
  const [paymentPref, setPaymentPref] = useState('cod')
  const [submitted, setSubmitted] = useState(null)

  const placeholderMap = {
    bakery: t('जैसे: 1 किलो चॉकलेट केक, कल शाम 5 बजे तक चाहिए', 'e.g. 1kg chocolate cake, needed by 5 PM tomorrow'),
    grocery: t('जैसे: 1 किलो चावल, आटा 5 किलो, तेल 1 लीटर, चीनी 1 किलो', 'e.g. 1kg rice, 5kg atta, 1L oil, 1kg sugar'),
    medicine: t('जैसे: पैरासिटामोल 10 गोली, पर्ची अटैच करें अगर है', 'e.g. Paracetamol strip of 10, attach prescription if you have one'),
    parcel: t('जैसे: पिकअप - सिविल लाइन्स, ड्रॉप - स्टेशन रोड, एक लिफाफा', 'e.g. Pickup - Civil Lines, Drop - Station Road, one envelope'),
    custom: t('अपनी ज़रूरत विस्तार से लिखें...', 'Describe exactly what you need...')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!requirement.trim() || !address.trim()) return
    const order = placeRequestOrder({
      category: categoryId,
      requirement: requirement.trim(),
      address: address.trim(),
      paymentMethodPreference: paymentPref
    })
    setSubmitted(order)
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

        <div>
          <label className="text-sm font-semibold text-ink/70 mb-1.5 block">
            {t('डिलीवरी पता', 'Delivery Address')}
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('पूरा पता लिखें (घर नं., मोहल्ला, लैंडमार्क)', 'Full address (house no., area, landmark)')}
            rows={2}
            required
            className="w-full bg-white rounded-2xl shadow-card p-4 outline-none text-sm text-ink placeholder:text-ink/30 resize-none"
          />
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
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition"
        >
          {t('रिक्वेस्ट भेजें', 'Submit Request')}
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
