import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { SERVICE_TYPES } from '../data/menuData'
import { useStore } from '../store/useStore'

function ServiceIcon({ svc }) {
  const [imgFailed, setImgFailed] = useState(false)
  if (svc.image && !imgFailed) {
    return (
      <img
        src={svc.image}
        alt=""
        className="w-12 h-12 object-contain"
        onError={() => setImgFailed(true)}
      />
    )
  }
  return <span className="text-3xl leading-none">{svc.emoji}</span>
}

export default function Services() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)
  // When set, shows that service's children (Technician / Transport)
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

      <div className="px-4 pt-3">
        {parent ? (
          <>
            <button
              type="button"
              onClick={() => setParentId(null)}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-3 active:opacity-70"
            >
              <ArrowLeft size={16} />
              {t('सभी सेवाएँ', 'All services')}
            </button>
            <p className="text-sm font-semibold text-ink/70 mb-3">
              {language === 'hi' ? parent.nameHi : parent.name} —{' '}
              {t('विकल्प चुनें', 'choose an option')}
            </p>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-4 border-l-4 border-primary mb-5">
            <p className="text-sm text-ink/70 leading-relaxed">
              {t(
                'इलेक्ट्रीशियन, तकनीशियन, प्लंबर, बढ़ई, ट्रांसपोर्ट, टिफिन, फैब्रिकेशन और अन्य सेवाएँ बुक करें। अपनी ज़रूरत बताएं — टीम कीमत कन्फर्म करेगी।',
                'Book electrician, technician, plumber, carpenter, transport, tiffin, fabrication and more. Describe what you need — our team will confirm the price.'
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {list.map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() => handleServiceClick(svc)}
              className="flex flex-col items-start gap-2 bg-white rounded-2xl p-4 shadow-card border border-black/[0.03] active:scale-[0.97] transition text-left min-h-[120px]"
            >
              <ServiceIcon svc={svc} />
              <div className="w-full">
                <p className="font-display font-700 text-sm text-ink leading-tight">
                  {language === 'hi' ? svc.nameHi : svc.name}
                </p>
                {svc.hint && (
                  <p className="text-[11px] text-ink/45 mt-0.5 leading-snug">
                    {language === 'hi' ? svc.hintHi : svc.hint}
                  </p>
                )}
              </div>
              <span className="mt-auto self-end text-primary">
                <ChevronRight size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
