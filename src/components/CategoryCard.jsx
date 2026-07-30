import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const META = {
  food:     { bg: '#FFF0D6', image: '/icons/cat-food.png',     emoji: '🍔' },
  bakery:   { bg: '#FFF6E0', image: '/icons/cat-bakery.png',   emoji: '🥖' },
  grocery:  { bg: '#E5F6E8', image: '/icons/cat-grocery.png',  emoji: '🛒' },
  services: { bg: '#E8EEF2', image: '/icons/cat-services.png', emoji: '🔧' },
  parcel:   { bg: '#F1E6F8', image: '/icons/cat-parcel.png',   emoji: '📦' },
  custom:   { bg: '#FCE6EE', image: '/icons/cat-custom.png',   emoji: '📋' }
}

// Priced menus vs free-text request flows
const MENU_ROUTES = {
  food: '/food',
  bakery: '/food/bakery-items',
  services: '/services'
}

export default function CategoryCard({ category }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const meta = META[category.id] || { bg: '#FFF0D6', image: null, emoji: category.emoji }

  const handleClick = () => {
    const route = MENU_ROUTES[category.id]
    if (route) navigate(route)
    else navigate(`/request/${category.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center gap-1 rounded-[16px] px-1.5 py-2.5 active:scale-[0.96] transition shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-black/[0.03]"
      style={{ backgroundColor: meta.bg }}
    >
      <div className="w-[56px] h-[56px] flex items-center justify-center">
        {meta.image ? (
          <img
            src={meta.image}
            alt=""
            className="w-full h-full object-contain drop-shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fb = e.currentTarget.nextSibling
              if (fb) fb.style.display = 'block'
            }}
          />
        ) : null}
        <span
          className="text-[28px] leading-none"
          style={{ display: meta.image ? 'none' : 'block' }}
        >
          {meta.emoji}
        </span>
      </div>
      <span className="font-display font-700 text-[11px] text-ink text-center leading-tight">
        {language === 'hi' ? category.nameHi : category.name}
      </span>
    </button>
  )
}
