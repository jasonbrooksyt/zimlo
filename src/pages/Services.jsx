import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { SERVICE_TYPES } from '../data/menuData'
import { useStore } from '../store/useStore'

export default function Services() {
  const navigate = useNavigate()
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  return (
    <div className="app-shell pb-24">
      <Header back title="Services" titleHi="सेवाएँ" />

      <div className="px-4 pt-3">
        <div className="bg-white rounded-2xl shadow-card p-4 border-l-4 border-primary mb-5">
          <p className="text-sm text-ink/70 leading-relaxed">
            {t(
              'टिफिन, प्लंबर, बिजली, बढ़ई, मैकेनिक, ट्रांसपोर्ट और अन्य सेवाएँ बुक करें। अपनी ज़रूरत बताएं — टीम कीमत कन्फर्म करेगी।',
              'Book tiffin, plumber, electrician, carpenter, mechanic, transport and more. Describe what you need — our team will confirm the price.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SERVICE_TYPES.map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() => navigate(`/request/${svc.id}`)}
              className="flex flex-col items-start gap-2 bg-white rounded-2xl p-4 shadow-card border border-black/[0.03] active:scale-[0.97] transition text-left"
            >
              <span className="text-3xl leading-none">{svc.emoji}</span>
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
