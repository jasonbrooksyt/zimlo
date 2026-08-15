import { useEffect, useState } from 'react'
import { Store } from 'lucide-react'
import { useStore } from '../store/useStore'
import {
  isStoreOpen,
  getNextOpenInfo,
  getOpenTimeLabel,
  getCloseTimeLabel
} from '../lib/storeHours'

const DISMISS_KEY = 'zimlo_closed_dismissed_until'

/**
 * Flipkart-style closed shutter when outside operating hours.
 * User can dismiss to browse; order placement is still blocked in Cart/Checkout.
 * Admin routes are excluded by CustomerStoreGate in App.jsx.
 */
export default function StoreClosedOverlay() {
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [open, setOpen] = useState(() => isStoreOpen())
  const [info, setInfo] = useState(() => getNextOpenInfo())
  const [dismissed, setDismissed] = useState(() => {
    try {
      const until = Number(sessionStorage.getItem(DISMISS_KEY) || 0)
      return until > Date.now()
    } catch {
      return false
    }
  })

  useEffect(() => {
    const tick = () => {
      const nowOpen = isStoreOpen()
      setOpen(nowOpen)
      setInfo(getNextOpenInfo())
      if (nowOpen) {
        try {
          sessionStorage.removeItem(DISMISS_KEY)
        } catch { /* ignore */ }
        setDismissed(false)
      }
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  const dismiss = () => {
    try {
      // Remember dismiss until next open window roughly (or 6h max)
      const ms = Math.min(info.minutesUntil * 60 * 1000, 6 * 60 * 60 * 1000)
      sessionStorage.setItem(DISMISS_KEY, String(Date.now() + Math.max(ms, 60_000)))
    } catch { /* ignore */ }
    setDismissed(true)
  }

  if (open || dismissed) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-[2px] px-5"
      role="dialog"
      aria-modal="true"
      aria-label={t('स्टोर बंद है', 'Store is closed')}
    >
      <div className="w-full max-w-[360px] bg-white rounded-3xl shadow-pop overflow-hidden animate-slide-up">
        <div className="bg-ink text-white px-5 py-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <Store size={22} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base leading-tight">
              {t('अभी बंद है', "We're closed right now")}
            </p>
            <p className="text-white/75 text-xs mt-0.5">
              {t(
                `समय: ${getOpenTimeLabel('hi')} – ${getCloseTimeLabel('hi')}`,
                `Hours: ${getOpenTimeLabel('en')} – ${getCloseTimeLabel('en')}`
              )}
            </p>
          </div>
        </div>

        <div className="px-5 py-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
            {language === 'hi' ? info.labelHi : info.labelEn}
          </div>
          <p className="text-ink/60 text-sm leading-relaxed">
            {t(
              'नए ऑर्डर स्टोर खुलने के बाद ही लिए जाएंगे। आप मेन्यू देख सकते हैं।',
              'New orders will be accepted after we open. You can still browse the menu.'
            )}
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="w-full bg-primary text-white font-bold py-3 rounded-2xl shadow-pop active:scale-[0.98] transition"
          >
            {t('मेन्यू देखें', 'Browse menu')}
          </button>
        </div>
      </div>
    </div>
  )
}
