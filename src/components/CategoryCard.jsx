import * as Icons from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// Large, tappable category card. Food routes to subcategories; every other
// category routes to a generic request form pre-filled with its identity.
export default function CategoryCard({ category }) {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const Icon = Icons[category.icon] || Icons.Circle

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
      className="group flex flex-col items-center justify-center gap-2 bg-white rounded-blob shadow-card p-4 aspect-square active:scale-95 transition"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center transition group-active:scale-90"
        style={{ backgroundColor: `${category.color}1F` }}
      >
        <Icon size={28} style={{ color: category.color }} strokeWidth={2.2} />
      </div>
      <span className="font-display font-600 text-sm text-ink text-center leading-tight">
        {language === 'hi' ? category.nameHi : category.name}
      </span>
    </button>
  )
}
