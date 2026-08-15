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
 * Centered shutter image. Countdown sits under Order hours.
 * Explore Menu sits below the banner card.
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-3"
          role="dialog"
          aria-modal="true"
          aria-label={t('स्टोर बंद है', 'Store is closed')}
        >
          <div className="w-full max-w-[460px] flex flex-col items-center gap-3">
            {/* Banner card */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-[#1a1a1a]">
              <img
                src="/store-closed-shutter.png"
                alt={t('स्टोर बंद है', 'We are closed')}
                className="w-full h-auto object-cover object-center block"
                style={{ minHeight: '52dvh', maxHeight: '68dvh', objectFit: 'cover' }}
              />

              {/* Bottom strip on image: order hours + countdown */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-12 pb-4 px-4">
                <p className="text-center text-white/85 text-xs mb-2">
                  {t('ऑर्डर समय', 'Order hours')}: {hoursLabel}
                </p>
                <p
                  className="text-center text-white font-bold text-3xl tabular-nums tracking-wider"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
                >
                  {countdown}
                </p>
              </div>
            </div>

            {/* Explore Menu — below the banner */}
            <button
              type="button"
              onClick={() => setModalDismissed(true)}
              className="w-full bg-white text-ink font-bold py-3.5 rounded-2xl active:scale-[0.98] transition shadow-lg"
            >
              {t('मेन्यू देखें', 'Explore Menu')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
