import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder, autoFocus = false }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-2xl shadow-card px-4 py-3">
      <Search size={18} className="text-ink/40 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 outline-none bg-transparent text-sm text-ink placeholder:text-ink/35"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Clear search" className="text-ink/30 active:text-ink/60">
          <X size={16} />
        </button>
      )}
    </div>
  )
}
