import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const META = {
  food: {
    bg: '#FFF4E0',
    image: '/icons/cat-food.png',
    emoji: '🍔',
    tag: 'Tasty & Fast',
    tagHi: 'स्वादिष्ट और तेज़'
  },
  bakery: {
    bg: '#FFF8E8',
    image: '/icons/cat-bakery.png',
    emoji: '🥖',
    tag: 'Fresh & Delicious',
    tagHi: 'ताज़ा और स्वादिष्ट'
  },
  grocery: {
    bg: '#E8F7EC',
    image: '/icons/cat-grocery.png',
    emoji: '🛒',
    tag: 'Daily Essentials',
    tagHi: 'रोज़मर्रा की ज़रूरत'
  },
  services: {
    bg: '#EEF2F6',
    image: '/icons/cat-services.png',
    emoji: '🔧',
    tag: 'Trusted Experts',
    tagHi: 'भरोसेमंद एक्सपर्ट'
  },
  parcel: {
    bg: '#F3EAF8',
    image: '/icons/cat-parcel.png',
    emoji: '📦',
    tag: 'Safe & Secure',
    tagHi: 'सुरक्षित डिलीवरी'
  },
  custom: {
    bg: '#FCE8F0',
    image: '/icons/cat-custom.png',
    emoji: '📋',
    tag: 'Your Wish, Our Command',
    tagHi: 'आपकी इच्छा, हमारा काम'
  }
}

const MENU_ROUTES = {
  food: '/food',
  bakery: '/food/bakery-items',
  services: '/services'
}

export default function CategoryCard({ category }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const meta = META[category.id] || {
    bg: '#FFF4E0',
    image: null,
    emoji: category.emoji,
    tag: '',
    tagHi: ''
  }

  const handleClick = () => {
    const route = MENU_ROUTES[category.id]
    if (route) navigate(route)
    else navigate(`/request/${category.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center text-center gap-1.5 rounded-[16px] px-1 py-2 active:scale-[0.97] transition shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-black/[0.03]"
      style={{ backgroundColor: meta.bg }}
    >
      <div className="w-[58px] h-[58px] flex items-center justify-center">
        {meta.image ? (
          <img
            src={meta.image}
            alt=""
            className="w-full h-full object-contain drop-shadow-md scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fb = e.currentTarget.nextSibling
              if (fb) fb.style.display = 'block'
            }}
          />
        ) : null}
        <span
          className="text-[30px] leading-none"
          style={{ display: meta.image ? 'none' : 'block' }}
        >
          {meta.emoji}
        </span>
      </div>
      <div className="px-0.5">
        <p className="font-display font-800 text-[12px] text-ink leading-tight">
          {language === 'hi' ? category.nameHi : category.name}
        </p>
        {(meta.tag || meta.tagHi) && (
          <p className="text-[9px] text-ink/45 font-medium mt-0.5 leading-tight">
            {language === 'hi' ? meta.tagHi : meta.tag}
          </p>
        )}
      </div>
    </button>
  )
}
