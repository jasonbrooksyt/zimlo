import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder, autoFocus = false }) {
  return (
    <div className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.08)] border border-black/[0.05]">
      <Search size={18} className="text-[#FF9800] shrink-0" strokeWidth={2.2} />
      <input
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 outline-none bg-transparent text-[15px] text-ink placeholder:text-ink/35 font-medium"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-ink/50 active:bg-black/20"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  )
}
