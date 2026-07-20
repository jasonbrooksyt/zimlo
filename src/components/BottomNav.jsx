import { Home, ClipboardList, ShoppingCart, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'

// Fixed bottom navigation — mirrors familiar Indian delivery-app patterns
// (Home / Orders / Cart / Profile) so it needs no explanation.
export default function BottomNav() {
  const cartCount = useStore((s) => s.cartItemCount())
  const language = useStore((s) => s.language)

  const items = [
    { to: '/home', icon: Home, label: 'Home', labelHi: 'होम' },
    { to: '/orders', icon: ClipboardList, label: 'Orders', labelHi: 'ऑर्डर' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', labelHi: 'कार्ट', badge: cartCount },
    { to: '/profile', icon: User, label: 'Profile', labelHi: 'प्रोफाइल' }
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-black/5 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] z-40">
      <div className="flex items-center justify-around py-2">
        {items.map(({ to, icon: Icon, label, labelHi, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition ${
                isActive ? 'text-primary bg-primary/10' : 'text-ink/50'
              }`
            }
          >
            <Icon size={22} strokeWidth={2.2} />
            <span className="text-[11px] font-medium">
              {language === 'hi' ? labelHi : label}
            </span>
            {badge > 0 && (
              <span className="absolute -top-0.5 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
