import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowLeft, Sparkles } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { SERVICE_TYPES } from '../data/menuData'
import { useStore } from '../store/useStore'

function ServiceIcon({ svc, large }) {
  const [imgFailed, setImgFailed] = useState(false)
  const size = large ? 'w-16 h-16' : 'w-14 h-14'
  if (svc.image && !imgFailed) {
    return (
      <img
        src={svc.image}
        alt=""
        className={`${size} object-contain drop-shadow-sm`}
        onError={() => setImgFailed(true)}
      />
    )
  }
  return (
    <span className={`${large ? 'text-4xl' : 'text-3xl'} leading-none`}>
      {svc.emoji}
    </span>
  )
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
          <div className="relative overflow-hidden rounded-2xl mb-5 bg-gradient-to-br from-primary to-[#ff6b00] p-4 shadow-pop">
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-1 bottom-0 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="font-display font-700 text-white text-sm leading-snug">
                  {t('घर बैठे सेवा बुक करें', 'Book home services')}
                </p>
                <p className="text-white/85 text-xs mt-1 leading-relaxed">
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
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${parent.color}18` }}
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
                className="group relative flex flex-col bg-white rounded-2xl p-3.5 shadow-card border border-black/[0.04] active:scale-[0.97] transition text-left overflow-hidden min-h-[148px]"
              >
                {/* soft color wash */}
                <div
                  className="absolute inset-x-0 top-0 h-20 opacity-[0.12]"
                  style={{
                    background: `linear-gradient(180deg, ${svc.color || '#FF9800'} 0%, transparent 100%)`
                  }}
                />

                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${svc.color || '#FF9800'}14` }}
                >
                  <ServiceIcon svc={svc} />
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

                <div className="relative mt-2 flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
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
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${svc.color || '#FF9800'}18` }}
                  >
                    <ChevronRight size={14} style={{ color: svc.color || '#FF9800' }} />
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
