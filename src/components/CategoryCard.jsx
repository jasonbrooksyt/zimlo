import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// Soft pastel category tiles — horizontal icon + label layout matching
// the polished home reference (3-column grid, rounded-2xl, gentle tint).
const PASTEL = {
  food: { bg: '#FFF3E0', emoji: '🍔' },
  bakery: { bg: '#FFF8E7', emoji: '🥖' },
  grocery: { bg: '#E8F5E9', emoji: '🛒' },
  medicine: { bg: '#E3F2FD', emoji: '💊' },
  parcel: { bg: '#F3E5F5', emoji: '📦' },
  custom: { bg: '#FCE4EC', emoji: '📋' }
}

export default function CategoryCard({ category }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const pastel = PASTEL[category.id] || { bg: '#FFF3E0', emoji: category.emoji }

  const handleClick = () => {
    if (category.id === 'food') {
      navigate('/food')
    } else {
      navigate(`/request/${category.id}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2.5 rounded-2xl px-3 py-3.5 active:scale-[0.97] transition shadow-sm border border-black/[0.03]"
      style={{ backgroundColor: pastel.bg }}
    >
      <span className="text-[28px] leading-none shrink-0 drop-shadow-sm">{pastel.emoji}</span>
      <span className="font-display font-700 text-[13px] text-ink text-left leading-tight">
        {language === 'hi' ? category.nameHi : category.name}
      </span>
    </button>
  )
}
