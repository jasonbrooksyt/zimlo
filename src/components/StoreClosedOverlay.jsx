import { useEffect, useState } from 'react'
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
 * Full-screen closed shutter — centered shop image with transparent countdown.
 */
export default function StoreClosedOverlay() {
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [open, setOpen] = useState(() => isStoreOpen())
  const [secondsLeft, setSecondsLeft] = useState(() => getNextOpenInfo().secondsUntil ?? 0)
  const [modalDismissed, setModalDismissed] = useState(false)

  useEffect(() => {
    const tick = () => {
      const nowOpen = isStoreOpen()
      setOpen(nowOpen)
      const next = getNextOpenInfo()
      setSecondsLeft(Math.max(0, next.secondsUntil ?? 0))
      if (nowOpen) setModalDismissed(false)
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
            return Math.max(0, next.secondsUntil ?? 0)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [open])

  useEffect(() => {
    if (!modalDismissed || open) return undefined
    const id = setTimeout(() => setModalDismissed(false), 90_000)
    return () => clearTimeout(id)
  }, [modalDismissed, open])

  if (open) return null

  const countdown = formatCountdown(secondsLeft)
  const hoursLabel = t(
    `${getOpenTimeLabel('hi')} – ${getCloseTimeLabel('hi')}`,
    `${getOpenTimeLabel('en')} – ${getCloseTimeLabel('en')}`
  )

  return (
    <>
      {modalDismissed && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[90] px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => setModalDismissed(false)}
            className="w-full flex items-center justify-between gap-2 bg-ink/90 text-white rounded-2xl px-3 py-2.5 shadow-pop active:scale-[0.99] transition"
          >
            <span className="text-xs font-semibold truncate">
              {t('अभी बंद है', "We're closed")}
              <span className="text-white/70"> · {hoursLabel}</span>
            </span>
            <span className="shrink-0 font-bold text-sm tabular-nums text-white px-2 py-1">
              {countdown}
            </span>
          </button>
        </div>
      )}

      {!modalDismissed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-label={t('स्टोर बंद है', 'Store is closed')}
        >
          {/* Centered card — larger banner */}
          <div className="relative w-[94%] max-w-[460px] mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/store-closed-shutter.png"
              alt={t('स्टोर बंद है', 'We are closed')}
              className="w-full h-auto object-cover object-center block"
              style={{ minHeight: '58dvh', maxHeight: '78dvh', objectFit: 'cover' }}
            />

            {/* Countdown centered on image — transparent, no orange box */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-white/90 text-[11px] font-semibold uppercase tracking-[0.2em] drop-shadow-md mb-1">
                {t('खुलने में', 'OPENS IN')}
              </p>
              <p
                className="text-white font-bold text-4xl sm:text-5xl tabular-nums tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)' }}
              >
                {countdown}
              </p>
            </div>

            {/* Bottom actions over image */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent pt-10 pb-4 px-5">
              <p className="text-center text-white/80 text-xs mb-3 drop-shadow">
                {t('ऑर्डर समय', 'Order hours')}: {hoursLabel}
              </p>
              <button
                type="button"
                onClick={() => setModalDismissed(true)}
                className="w-full bg-white/95 text-ink font-bold py-3.5 rounded-2xl active:scale-[0.98] transition shadow-lg"
              >
                {t('मेन्यू देखें', 'Explore Menu')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
