import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowLeft, Sparkles } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { SERVICE_TYPES } from '../data/menuData'
import { useStore } from '../store/useStore'

function ServiceIcon({ svc }) {
  // Try primary path, then common case variants (GitHub/Linux is case-sensitive)
  const candidates = []
  if (svc.image) {
    candidates.push(svc.image)
    const name = svc.image.split('/').pop() || ''
    const dir = svc.image.slice(0, svc.image.lastIndexOf('/') + 1)
    if (name) {
      candidates.push(dir + name.charAt(0).toUpperCase() + name.slice(1)) // Fabrication.png
      candidates.push(dir + name.toLowerCase())
      candidates.push(dir + name.toUpperCase())
    }
  }
  const [idx, setIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const src = idx >= 0 ? candidates[idx] : null

  if (src) {
    return (
      <div className="relative w-[72px] h-[72px] flex items-center justify-center">
        <img
          src={src}
          alt=""
          className={`w-[72px] h-[72px] object-contain transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false)
            if (idx < candidates.length - 1) setIdx((i) => i + 1)
            else setIdx(-1)
          }}
        />
        {!loaded && (
          <span className="absolute inset-0 flex items-center justify-center text-[42px] leading-none">
            {svc.emoji}
          </span>
        )}
      </div>
    )
  }
  return <span className="text-[42px] leading-none">{svc.emoji}</span>
}

export default function Services() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  const [parentId, setParentId] = useState(null)

  const parent = parentId ? SERVICE_TYPES.find((s) => s.id === parentId) : null
  const list = parent?.children?.length ? parent.children : SERVICE_TYPES

  const handleServiceClick = (svc) => {
    if (svc.children?.length) {
      setParentId(svc.id)
      return
    }
    navigate(`/request/${svc.id}`)
  }

  return (
    <div className="app-shell pb-24">
      <Header back title="Services" titleHi="सेवाएँ" />

      <div className="px-4 pt-2">
        {parent ? (
          <button
            type="button"
            onClick={() => setParentId(null)}
            className="flex items-center gap-1.5 text-sm font-bold text-primary mb-3 active:opacity-70"
          >
            <ArrowLeft size={16} />
            {t('सभी सेवाएँ', 'All services')}
          </button>
        ) : (
          <div className="relative overflow-hidden rounded-2xl mb-5 bg-white border border-primary/15 shadow-card p-4">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl" />
            <div className="flex items-start gap-3 pl-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-display font-700 text-ink text-sm leading-snug">
                  {t('घर बैठे सेवा बुक करें', 'Book home services')}
                </p>
                <p className="text-ink/55 text-xs mt-1 leading-relaxed">
                  {t(
                    'अपनी ज़रूरत बताएं — टीम कीमत कन्फर्म करेगी और काम शेड्यूल करेगी।',
                    'Tell us what you need — we confirm the price and schedule the work.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {parent && (
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white shadow-card"
            >
              <ServiceIcon svc={parent} />
            </div>
            <div>
              <p className="font-display font-700 text-base text-ink">
                {language === 'hi' ? parent.nameHi : parent.name}
              </p>
              <p className="text-xs text-ink/50">
                {t('नीचे से विकल्प चुनें', 'Choose an option below')}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {list.map((svc) => {
            const hasChildren = !!svc.children?.length
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => handleServiceClick(svc)}
                className="group relative flex flex-col bg-white rounded-2xl p-3.5 shadow-card border border-black/[0.04] active:scale-[0.97] transition text-left overflow-hidden min-h-[168px]"
              >
                <div
                  className="absolute inset-x-0 top-0 h-24 opacity-[0.10]"
                  style={{
                    background: `linear-gradient(180deg, ${svc.color || '#FF9800'} 0%, transparent 100%)`
                  }}
                />

                {/* Icon — large, no clipping corners */}
                <div className="relative flex items-center justify-center mb-2 pt-1">
                  <div
                    className="w-[88px] h-[88px] rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${svc.color || '#FF9800'}12` }}
                  >
                    <ServiceIcon svc={svc} />
                  </div>
                </div>

                <div className="relative flex-1">
                  <p className="font-display font-700 text-[13px] text-ink leading-tight">
                    {language === 'hi' ? svc.nameHi : svc.name}
                  </p>
                  {svc.hint && (
                    <p className="text-[11px] text-ink/45 mt-1 leading-snug line-clamp-2">
                      {language === 'hi' ? svc.hintHi : svc.hint}
                    </p>
                  )}
                </div>

                <div className="relative mt-2.5 flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      color: svc.color || '#FF9800',
                      backgroundColor: `${svc.color || '#FF9800'}14`
                    }}
                  >
                    {hasChildren
                      ? t('विकल्प देखें', 'See options')
                      : t('बुक करें', 'Book now')}
                  </span>
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${svc.color || '#FF9800'}18` }}
                  >
                    <ChevronRight size={15} style={{ color: svc.color || '#FF9800' }} />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
