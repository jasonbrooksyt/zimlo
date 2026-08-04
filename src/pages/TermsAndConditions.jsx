import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, COD_FEE } from '../data/menuData'

// Static "Terms & Conditions" page. DRAFT content based on Zimlo's actual
// order flow as implemented in this codebase. Fee numbers are pulled from
// src/data/menuData.js (the same constants Checkout.jsx actually charges)
// so this page can't silently drift out of sync if fees change later. Not
// legal advice — review before treating as final.
export default function TermsAndConditions() {
  return (
    <div className="app-shell pb-24">
      <Header back title="Terms & Conditions" titleHi="नियम व शर्तें" />

      <div className="px-4 pt-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h1 className="font-display font-800 text-lg text-primary mb-2">Terms & Conditions</h1>
          <p className="text-xs text-ink/50 mb-3">आख़िरी बार अपडेट: {new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long' })}</p>
          <p className="text-sm text-ink/80 leading-relaxed">
            Zimlo का इस्तेमाल करके, आप नीचे दी गई शर्तों से सहमत होते हैं। कृपया ऑर्डर करने से पहले इन्हें ध्यान से पढ़ें।
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">हमारी सेवा</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Zimlo एक Local Delivery Platform है, जो पीलूखेड़ी और कुरावर क्षेत्र में Food, Grocery, Medicine,
            Parcel और अन्य Home Services की Delivery कराता है। कुछ ऑर्डर (जैसे Grocery, Parcel, Services) की
            कीमत Fixed नहीं होती — हमारी टीम आपकी Request देखकर एक Quote भेजती है, जिसे आप Accept करने के बाद
            ही ऑर्डर आगे बढ़ता है।
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">अकाउंट और लॉगिन</h2>
          <ul className="space-y-2">
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>ऑर्डर देने के लिए मोबाइल नंबर पर OTP से लॉगिन ज़रूरी है — यह आपकी पहचान और ऑर्डर हिस्ट्री सुरक्षित रखने के लिए है।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>आपको अपनी सही और सटीक जानकारी (नाम, मोबाइल नंबर, एड्रेस) देनी चाहिए, ताकि डिलीवरी सही तरीके से हो सके।</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">पेमेंट और फीस</h2>
          <ul className="space-y-2">
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>पेमेंट के दो तरीके उपलब्ध हैं — Cash on Delivery (COD) और Online Payment (Razorpay के ज़रिए UPI/Card/Netbanking)।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>डिलीवरी फीस ₹{DELIVERY_FEE} है, जो ₹{FREE_DELIVERY_THRESHOLD} या उससे ज़्यादा के ऑर्डर पर माफ़ हो जाती है।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>Cash on Delivery चुनने पर ₹{COD_FEE} की एक अतिरिक्त COD Convenience Fee लगती है।</span>
            </li>
            <li className="text-sm text-ink/80 leading-relaxed flex gap-2">
              <span className="text-primary shrink-0">•</span>
              <span>सभी कीमतें ऑर्डर के समय दिखाई गई कीमत के अनुसार ही ली जाती हैं — Checkout पर दिखाई गई राशि ही Final राशि है।</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">डिलीवरी</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            हम हर ऑर्डर को जल्द से जल्द पहुँचाने की पूरी कोशिश करते हैं, लेकिन डिलीवरी का समय ट्रैफिक, मौसम,
            ऑर्डर की मात्रा और लोकेशन जैसी चीज़ों पर निर्भर करता है — इसलिए exact समय की गारंटी नहीं दी जा सकती।
            फिलहाल हमारी सेवा सिर्फ पीलूखेड़ी और कुरावर क्षेत्र तक सीमित है।
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">ज़िम्मेदारी की सीमा</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            Zimlo एक Delivery Platform है — कुछ Products (जैसे Restaurant का खाना) की Quality सीधे उस
            Restaurant/Seller की ज़िम्मेदारी होती है। किसी समस्या की स्थिति में हम आपकी शिकायत सुनने और
            उचित समाधान (रिफंड/रीप्लेसमेंट) निकालने की पूरी कोशिश करेंगे — देखें हमारी Refund Policy।
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">बदलाव</h2>
          <p className="text-sm text-ink/80 leading-relaxed">
            हम समय-समय पर इन Terms में बदलाव कर सकते हैं। कोई बड़ा बदलाव होने पर यह जानकारी इसी पेज पर अपडेट कर दी जाएगी।
            Zimlo का इस्तेमाल जारी रखने का मतलब है कि आप अपडेटेड Terms से सहमत हैं।
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
