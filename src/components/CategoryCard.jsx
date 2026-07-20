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
      className="group relative flex flex-col items-center justify-center gap-2 bg-white rounded-blob shadow-card p-4 aspect-square active:scale-95 transition overflow-hidden"
    >
      {/* soft color wash in the corner, like Swiggy's category tiles */}
      <div
        className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20 group-active:opacity-30 transition"
        style={{ backgroundColor: category.color }}
      />
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center transition group-active:scale-90 relative z-10"
        style={{ backgroundColor: `${category.color}1F` }}
      >
        <Icon size={28} style={{ color: category.color }} strokeWidth={2.2} />
      </div>
      <span className="font-display font-600 text-sm text-ink text-center leading-tight relative z-10">
        {language === 'hi' ? category.nameHi : category.name}
      </span>
    </button>
  )
}
