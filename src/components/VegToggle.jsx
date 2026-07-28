import { Leaf } from 'lucide-react'

export default function VegToggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 bg-white rounded-full shadow-card pl-2.5 pr-1.5 py-1.5 shrink-0 border border-black/[0.04]"
    >
      <Leaf size={14} className={checked ? 'text-green-600' : 'text-ink/35'} />
      <span className="text-xs font-semibold text-ink whitespace-nowrap">{label}</span>
      <span
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-green-600' : 'bg-ink/15'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}
