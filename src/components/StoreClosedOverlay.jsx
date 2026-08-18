import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import {
  isStoreOpen,
  getNextOpenInfo,
  getOpenTimeLabel,
  getCloseTimeLabel
} from '../lib/storeHours'

function formatCountdown(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(sec)}`
  return `${pad(m)}:${pad(sec)}`
}

/**
 * - Always: thin non-blocking top pill when closed (browse freely)
 * - Checkout only: full shutter — "order processed after open"
 * Cart is never cleared by closed state.
 */
export default function StoreClosedOverlay() {
  const location = useLocation()
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const isCheckout = location.pathname.startsWith('/checkout')

  const [open, setOpen] = useState(() => isStoreOpen())
  const [info, setInfo] = useState(() => getNextOpenInfo())
  const [secondsLeft, setSecondsLeft] = useState(() => getNextOpenInfo().secondsUntil ?? 0)
  const [checkoutModalDismissed, setCheckoutModalDismissed] = useState(false)

  useEffect(() => {
    setCheckoutModalDismissed(false)
  }, [location.pathname])

  useEffect(() => {
    const tick = () => {
      const nowOpen = isStoreOpen()
      setOpen(nowOpen)
      const next = getNextOpenInfo()
      setInfo(next)
      setSecondsLeft(Math.max(0, next.secondsUntil ?? 0))
    }
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (open) return undefined
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nowOpen = isStoreOpen()
          setOpen(nowOpen)
          if (!nowOpen) {
            const next = getNextOpenInfo()
            setInfo(next)
            return Math.max(0, next.secondsUntil ?? 0)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [open])

  if (open) return null

  const countdown = formatCountdown(secondsLeft)
  const openLabel = getOpenTimeLabel(language === 'hi' ? 'hi' : 'en')
  const hoursLabel = t(
    `${getOpenTimeLabel('hi')} – ${getCloseTimeLabel('hi')}`,
    `${getOpenTimeLabel('en')} – ${getCloseTimeLabel('en')}`
  )

  const showFullCheckoutModal = isCheckout && !checkoutModalDismissed

  return (
    <>
      <style>{`
        @keyframes zimlo-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .zimlo-bounce { animation: zimlo-bounce 1.1s ease-in-out infinite; display: inline-block; }
      `}</style>

      {/* Thin always-on indicator — does not block browsing */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[90] px-3 pt-[max(0.4rem,env(safe-area-inset-top))] pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-[320px] flex items-center justify-center gap-2 bg-ink/50 backdrop-blur-[2px] text-white rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm border border-white/10">
          <span className="opacity-90 truncate">
            {t(`खुलेगा ${openLabel}`, `Opens at ${openLabel}`)}
          </span>
          <span className="tabular-nums text-white/90 font-bold">{countdown}</span>
        </div>
      </div>

      {/* Full shutter — checkout only */}
      {showFullCheckoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-3"
          style={{
            background: 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)'
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-[460px] flex flex-col items-center gap-3">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-[#1a1a1a]">
              <img
                src="/store-closed-shutter.png"
                alt={t('स्टोर बंद है', 'We are closed')}
                className="w-full h-auto object-cover object-center block"
                style={{ minHeight: '48dvh', maxHeight: '62dvh', objectFit: 'cover' }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-14 pb-5 px-4">
                <p className="text-center text-white font-bold text-[15px] leading-snug mb-2">
                  {t(
                    `आपका ऑर्डर ${openLabel} के बाद प्रोसेस होगा`,
                    `Order will be processed after ${openLabel}`
                  )}
                </p>
                <p className="text-center text-white/75 text-xs mb-3">
                  {t('ऑर्डर समय', 'Order hours')}: {hoursLabel}
                </p>
                <p
                  className="text-center text-white font-bold text-3xl tabular-nums tracking-wider"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
                >
                  {countdown}
                </p>
                <p className="text-center text-white/60 text-[11px] mt-2">
                  {language === 'hi' ? info.labelHi : info.labelEn}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCheckoutModalDismissed(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#F44336] text-white font-bold py-3.5 rounded-2xl active:scale-[0.98] transition shadow-lg shadow-red-500/30"
            >
              <span className="zimlo-bounce text-xl leading-none" aria-hidden>
                👉
              </span>
              <span>{t('समझ गए — आगे बढ़ें', 'Got it — Continue')}</span>
              <span className="zimlo-bounce text-xl leading-none" aria-hidden>
                👈
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
