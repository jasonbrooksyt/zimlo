import { MessageCircle } from 'lucide-react'
import { useStore } from '../store/useStore'

// Floating WhatsApp order button — lets a customer skip browsing the app
// entirely and message the Zimlo team directly to place an order (handy
// for anything not on the menu, or people who just prefer WhatsApp).
// Opens with a friendly prefilled message via wa.me.
const WHATSAPP_NUMBER = '919232878806' // +91 9232878806, no spaces/symbols for wa.me

export default function WhatsAppButton() {
  const cartItemCount = useStore((s) => s.cartItemCount())
  const message = encodeURIComponent('Hi Zimlo! मुझे ऑर्डर करना है:')
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`

  // When the cart bar is showing (items in cart), float higher so the two
  // buttons never overlap.
  const bottomOffset = cartItemCount > 0 ? 'bottom-[140px]' : 'bottom-[76px]'

  return (
    <div className={`fixed ${bottomOffset} left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-40 pointer-events-none transition-all`}>
      <div className="flex justify-end">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order on WhatsApp"
          className="pointer-events-auto w-14 h-14 rounded-full bg-[#25D366] shadow-pop flex items-center justify-center active:scale-90 transition"
        >
          <MessageCircle size={26} className="text-white" fill="white" />
        </a>
      </div>
    </div>
  )
}
