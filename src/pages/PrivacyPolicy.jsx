import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

// Static "Privacy Policy" page. DRAFT content based on Zimlo's actual data
// practices as implemented in this codebase (Supabase for storage, Razorpay
// for payments, phone/address/order data collected for delivery). This is
// a starting point for the Zimlo team to review — not legal advice, and
// should be checked by a professional before being treated as final.
export default function PrivacyPolicy() {
  const sections = [
    {
      title: 'हम क्या जानकारी लेते हैं',
      body: [
        'ऑर्डर देने के लिए: आपका नाम, मोबाइल नंबर, डिलीवरी एड्रेस।',
        'ऑर्डर हिस्ट्री: आपने क्या ऑर्डर किया, कब किया, कितना पेमेंट हुआ — यह जानकारी आपके अकाउंट से जुड़ी रहती है।',
        'लोकेशन: डिलीवरी एड्रेस सेट करते समय, अगर आप अनुमति देते हैं तो आपकी लोकेशन का इस्तेमाल सही पता ढूँढने में मदद के लिए होता है।',
        'लॉगिन: मोबाइल नंबर पर OTP भेजकर पहचान की पुष्टि की जाती है।'
      ]
    },
    {
      title: 'इस जानकारी का इस्तेमाल कैसे होता है',
      body: [
        'आपका ऑर्डर सही जगह, सही समय पर पहुँचाने के लिए।',
        'डिलीवरी से जुड़ी अपडेट देने के लिए (WhatsApp या कॉल के ज़रिए)।',
        'ऑर्डर हिस्ट्री दिखाने और दोबारा ऑर्डर करना आसान बनाने के लिए।',
        'कूपन, ऑफर या रेफरल जैसी सुविधाएँ सही तरीके से लागू करने के लिए।'
      ]
    },
    {
      title: 'हम आपकी जानकारी कहाँ शेयर करते हैं',
      body: [
        'पेमेंट प्रोसेस करने के लिए Razorpay — जब आप ऑनलाइन पेमेंट चुनते हैं, तभी आपकी पेमेंट जानकारी सीधे Razorpay के पास जाती है, Zimlo के सर्वर पर कभी नहीं रुकती।',
        'हमारा डेटा Supabase पर सुरक्षित तरीके से स्टोर होता है, जो केवल अधिकृत Zimlo टीम को ही एक्सेस मिलती है।',
        'हम आपकी जानकारी किसी को बेचते नहीं हैं, न ही मार्केटिंग के लिए किसी तीसरे पक्ष को देते हैं।'
      ]
    },
    {
      title: 'आपके अधिकार',
      body: [
        'आप अपनी प्रोफाइल जानकारी (नाम, एड्रेस) कभी भी ऐप में जाकर बदल सकते हैं।',
        'अगर आप चाहें कि आपका अकाउंट और उससे जुड़ा डेटा हटा दिया जाए, तो हमें Contact Us पेज से संपर्क करें — हम इसे प्रोसेस करेंगे।'
      ]
    },
    {
      title: 'कुकीज़ और लोकल स्टोरेज',
      body: [
        'आपका कार्ट और कुछ प्राथमिकताएँ आपके डिवाइस पर (browser storage में) रखी जाती हैं, ताकि ऐप दोबारा खोलने पर आपका कार्ट सुरक्षित रहे।',
        'यह जानकारी हमारे सर्वर पर तब तक नहीं भेजी जाती जब तक आप ऑर्डर पूरा नहीं करते।'
      ]
    },
    {
      title: 'इस पॉलिसी में बदलाव',
      body: [
        'समय-समय पर हम इस Privacy Policy को अपडेट कर सकते हैं। कोई बड़ा बदलाव होने पर हम इसी पेज पर जानकारी अपडेट करेंगे।'
      ]
    }
  ]

  return (
    <div className="app-shell pb-24">
      <Header back title="Privacy Policy" titleHi="गोपनीयता नीति" />

      <div className="px-4 pt-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h1 className="font-display font-800 text-lg text-primary mb-2">Privacy Policy</h1>
          <p className="text-xs text-ink/50 mb-3">आख़िरी बार अपडेट: {new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long' })}</p>
          <p className="text-sm text-ink/80 leading-relaxed">
            Zimlo आपकी प्राइवेसी को गंभीरता से लेता है। यह पेज बताता है कि जब आप Zimlo इस्तेमाल करते हैं,
            तो हम कौन सी जानकारी लेते हैं और उसका इस्तेमाल कैसे करते हैं।
          </p>
        </div>

        {sections.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-display font-700 text-base text-ink mb-3">{s.title}</h2>
            <ul className="space-y-2">
              {s.body.map((line, i) => (
                <li key={i} className="text-sm text-ink/80 leading-relaxed flex gap-2">
                  <span className="text-primary shrink-0">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="bg-cream rounded-2xl p-5 border border-primary/10">
          <h2 className="font-display font-700 text-base text-ink mb-1.5">सवाल है?</h2>
          <p className="text-sm text-ink/70 leading-relaxed">
            Privacy से जुड़े किसी भी सवाल के लिए delivery@zimlo.in पर ईमेल करें या Contact Us पेज से WhatsApp करें।
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
