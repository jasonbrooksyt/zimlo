import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

// Static "About Us" page — content as provided directly by the Zimlo team,
// shown as-is rather than run through the language toggle, since this is
// the brand's own finalized copy.
export default function AboutUs() {
  const services = [
    { emoji: '🍽️', label: 'Food Delivery' },
    { emoji: '🛒', label: 'Grocery Delivery' },
    { emoji: '🔧', label: 'Home Services' },
    { emoji: '🎂', label: 'Sweets & Bakery' },
    { emoji: '📦', label: 'Parcel & Daily Essentials' },
    { emoji: '🛍️', label: '"Jo Chahiye Wo Mangaiye" Service' }
  ]

  return (
    <div className="app-shell pb-24">
      <Header back title="About Us" titleHi="हमारे बारे में" />

      <div className="px-4 pt-2 space-y-5">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h1 className="font-display font-800 text-xl text-primary mb-3">Welcome to Zimlo</h1>
          <p className="text-sm text-ink/80 leading-relaxed">
            Zimlo एक Local Delivery Platform है, जिसका उद्देश्य पीलूखेड़ी और कुरावर के लोगों तक उनकी
            ज़रूरत का सामान तेज़ी, आसानी और भरोसे के साथ पहुँचाना है।
          </p>
          <p className="text-sm text-ink/80 leading-relaxed mt-3">
            हम सिर्फ Food Delivery तक सीमित नहीं हैं। अगर आपको खाना, किराना, मिठाई, पार्सल,
            होम सर्विस (इलेक्ट्रीशियन, प्लंबर आदि) या कोई भी ज़रूरी सामान चाहिए, तो बस हमें
            WhatsApp पर बताइए। बाकी काम Zimlo करेगा।
          </p>
          <p className="text-sm text-ink/80 leading-relaxed mt-3">
            हमारा लक्ष्य है कि जहाँ बड़ी Delivery Services उपलब्ध नहीं हैं, वहाँ भी लोगों को आधुनिक और
            भरोसेमंद डिलीवरी सुविधा मिले।
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-700 text-base text-ink mb-3">हमारी सेवाएँ</h2>
          <div className="grid grid-cols-2 gap-3">
            {services.map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-cream rounded-xl p-3">
                <span className="text-xl">{s.emoji}</span>
                <span className="text-sm font-medium text-ink leading-snug">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-5 shadow-pop">
          <h2 className="font-display font-700 text-base text-white mb-1.5">हमारा मिशन</h2>
          <p className="text-sm text-white/95 leading-relaxed">
            Local लोगों के लिए Fast, Reliable और Affordable Delivery Service उपलब्ध कराना।
          </p>
        </div>

        <div className="bg-ink rounded-2xl p-5">
          <h2 className="font-display font-700 text-base text-white mb-1.5">हमारा विज़न</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Zimlo को हर छोटे शहर और कस्बे की सबसे भरोसेमंद Local Delivery Service बनाना।
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
