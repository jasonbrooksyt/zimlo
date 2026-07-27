import { MessageCircle, Mail, Globe, Instagram, Facebook, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

// Static "Contact Us" page — each row opens the right app (WhatsApp,
// email client) where the platform gives us a solid deep link; the rest
// are shown as plain info rows.
export default function ContactUs() {
  const contactMethods = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: '+91 92328 78806',
      href: 'https://wa.me/919232878806',
      color: '#25D366'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'delivery@zimlo.in',
      href: 'mailto:delivery@zimlo.in',
      color: '#FF9800'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'zimlo.delivery@gmail.com',
      href: 'mailto:zimlo.delivery@gmail.com',
      color: '#FF9800'
    },
    {
      icon: Globe,
      label: 'Website',
      value: 'www.zimlo.in',
      href: 'https://www.zimlo.in',
      color: '#03A9F4'
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: '@zimlo.in',
      href: 'https://instagram.com/zimlo.in',
      color: '#E1306C'
    },
    {
      icon: Facebook,
      label: 'Facebook',
      value: 'Zimlo',
      href: null,
      color: '#1877F2'
    }
  ]

  return (
    <div className="app-shell pb-24">
      <Header back title="Contact Us" titleHi="संपर्क करें" />

      <div className="px-4 pt-2">
        <p className="text-sm text-ink/60 mb-4">
          किसी भी सवाल, ऑर्डर से जुड़ी मदद, या सुझाव के लिए हमसे संपर्क करें
        </p>

        <div className="bg-white rounded-2xl shadow-card divide-y divide-black/5 overflow-hidden">
          {contactMethods.map((c, i) => {
            const Content = (
              <div className="flex items-center gap-3 p-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${c.color}1F` }}
                >
                  <c.icon size={19} style={{ color: c.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ink/50">{c.label}</p>
                  <p className="text-sm font-semibold text-ink truncate">{c.value}</p>
                </div>
                {c.href && <ChevronRight size={18} className="text-ink/30 shrink-0" />}
              </div>
            )
            return c.href ? (
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className="block active:bg-cream/60 transition">
                {Content}
              </a>
            ) : (
              <div key={i}>{Content}</div>
            )
          })}
        </div>

        <a
          href="https://wa.me/919232878806"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3.5 rounded-2xl shadow-pop active:scale-[0.98] transition"
        >
          <MessageCircle size={18} />
          WhatsApp पर मैसेज करें
        </a>
      </div>

      <BottomNav />
    </div>
  )
}
