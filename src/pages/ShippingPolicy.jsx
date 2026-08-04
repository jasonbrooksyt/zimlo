import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, REFERRAL_DELIVERY_DISCOUNT } from '../data/menuData'

// Static "Shipping / Delivery Policy" page. DRAFT content, fee numbers
// pulled from src/data/menuData.js so they stay in sync with what
// Checkout.jsx actually charges. Not legal advice — review before final.
export default function ShippingPolicy() {
  return (
    <div className="app-shell pb-24">
      <Header back title="Delivery Policy" titleHi="डिलीवरी नीति" />

      <div className="px-4 pt-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h1 className="font-display font-800 text-lg text-primary mb-2">Shipping & Delivery Policy</h1>
          <p className="text-xs text-ink/50 mb-3">आख़िरी बार अपडेट: {new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long' })}</p>
          <p className="text-sm text-ink/80 leading-relaxed">
            Zimlo सिर्फ Local Delivery करता है — कोई कूरियर या इंटर-सिटी शिपिंग नहीं। नीचे पूरी जानकारी दी गई है
            कि हम कहाँ, कैसे और कितने में डिलीवर करते हैं।
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">सेवा क्षेत्र</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            फिलहाल Zimlo सिर्फ <span className="font-semibold text-ink">पीलूखेड़ी और कुरावर</span> (मध्य प्रदेश)
            में उपलब्ध है। अगर आपका एड्रेस इस क्षेत्र से बाहर है, तो ऑर्डर डिलीवर नहीं किया जा सकेगा।
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">डिलीवरी में कितना समय लगता है</h2>
          <ul className="space-y-2">
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Food ऑर्डर — आमतौर पर Restaurant की तैयारी और आपकी लोकेशन के हिसाब से डिलीवर होता है।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Grocery, Medicine, Parcel, Services जैसी Request-based ऑर्डर — हमारी टीम पहले Quote भेजती है, Accept करने के बाद डिलीवरी शुरू होती है।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Exact समय ट्रैफिक, मौसम और ऑर्डर की मात्रा पर निर्भर करता है — इसकी 100% गारंटी नहीं दी जा सकती।</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">डिलीवरी चार्ज</h2>
          <ul className="space-y-2">
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>डिलीवरी फीस ₹{DELIVERY_FEE} प्रति ऑर्डर है।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>₹{FREE_DELIVERY_THRESHOLD} या उससे ज़्यादा के ऑर्डर पर डिलीवरी फीस पूरी तरह माफ़।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>रेफरल लिंक से आए नए ग्राहकों को पहले ऑर्डर पर डिलीवरी फीस में ₹{REFERRAL_DELIVERY_DISCOUNT} की छूट मिलती है।</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">अगर आप डिलीवरी के समय उपलब्ध नहीं हैं</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            डिलीवरी पार्टनर आपको कॉल करेगा। अगर संपर्क नहीं हो पाता, तो ऑर्डर की स्थिति के अनुसार आगे की
            कार्रवाई (दोबारा कोशिश या ऑर्डर कैंसिल) तय की जाएगी — Cash on Delivery ऑर्डर में बिना डिलीवरी के
            कोई पेमेंट नहीं ली जाती।
          </p>
        </div>

        <div className="bg-cream rounded-2xl p-5 border border-primary/10">
          <h2 className="font-display font-700 text-base text-ink mb-1.5">सवाल है?</h2>
          <p className="text-sm text-ink/70 leading-relaxed">
            delivery@zimlo.in पर ईमेल करें या Contact Us पेज से WhatsApp करें।
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
