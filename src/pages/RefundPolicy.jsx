import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

// Static "Refund & Cancellation Policy" page. DRAFT content based on
// Zimlo's actual order flow (COD + Razorpay online payment, admin-quoted
// request orders) — reflects what the codebase actually supports today.
// Not legal advice — review before treating as final.
export default function RefundPolicy() {
  return (
    <div className="app-shell pb-24">
      <Header back title="Refund Policy" titleHi="रिफंड नीति" />

      <div className="px-4 pt-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h1 className="font-display font-800 text-lg text-primary mb-2">Refund & Cancellation Policy</h1>
          <p className="text-xs text-ink/50 mb-3">आख़िरी बार अपडेट: {new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long' })}</p>
          <p className="text-sm text-ink/80 leading-relaxed">
            खाना, किराना और दूसरी चीज़ें एक बार तैयार या डिस्पैच होने के बाद वापस नहीं ली जा सकतीं,
            इसलिए हमारी Cancellation विंडो सीमित है। नीचे पूरी जानकारी दी गई है।
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">ऑर्डर कैंसिल करना</h2>
          <ul className="space-y-2">
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>ऑर्डर प्लेस करने के तुरंत बाद, अगर तैयारी शुरू नहीं हुई है, तो WhatsApp या कॉल करके कैंसिल किया जा सकता है।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>एक बार खाना बनना शुरू हो जाए या सामान पैक होकर डिलीवरी के लिए निकल जाए, उसके बाद ऑर्डर कैंसिल नहीं किया जा सकता।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Grocery, Medicine, Parcel या Services जैसी Request-based ऑर्डर, जिनकी कीमत हमारी टीम द्वारा confirm की जाती है — Quote Accept करने के बाद कैंसिलेशन नहीं हो सकता, जब तक सामान अभी तक भेजा न गया हो।</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">रिफंड कब मिलेगा</h2>
          <ul className="space-y-2">
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>अगर ऑर्डर गलत, खराब या डैमेज्ड पहुँचता है — डिलीवरी के 24 घंटे के अंदर हमें बताएं, हम रिफंड या रीप्लेसमेंट प्रोसेस करेंगे।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>अगर आपने Online Payment (Razorpay) से पेमेंट किया और ऑर्डर हमारी तरफ से कैंसिल हुआ (जैसे आइटम उपलब्ध न होना), तो पूरा पेमेंट रिफंड होगा।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Cash on Delivery (COD) ऑर्डर में, अगर ऑर्डर कैंसिल होता है, तो कोई पेमेंट लिया ही नहीं जाता — रिफंड की ज़रूरत नहीं पड़ती।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>पसंद न आने या मन बदलने की वजह से डिलीवर हो चुके खाने पर रिफंड नहीं दिया जाता (Food items स्वभाव से Perishable होते हैं)।</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">रिफंड कैसे और कब तक मिलेगा</h2>
          <ul className="space-y-2">
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Online Payment का रिफंड सीधे उसी पेमेंट मेथड (UPI/Card/Netbanking) में वापस भेजा जाता है, जो Razorpay के ज़रिए प्रोसेस होता है।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>रिफंड अप्रूव होने के बाद बैंक/UPI ऐप में दिखने में आमतौर पर 5–7 कार्यदिवस (working days) लग सकते हैं — यह समय Razorpay और आपके बैंक पर निर्भर करता है।</span>
            </li>
          </ul>
        </div>

        <div className="bg-cream rounded-2xl p-5 border border-primary/10">
          <h2 className="font-display font-700 text-base text-ink mb-1.5">रिफंड रिक्वेस्ट करनी है?</h2>
          <p className="text-sm text-ink/70 leading-relaxed">
            Order ID के साथ delivery@zimlo.in पर ईमेल करें या Contact Us पेज से WhatsApp करें — हम जल्द से जल्द जवाब देंगे।
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
