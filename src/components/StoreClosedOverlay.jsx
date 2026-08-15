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
 * Full-screen closed shutter using the Zimlo shop image.
 * Live countdown overlaid on the image.
 */
export default function StoreClosedOverlay() {
  const language = useStore((s) => s.language)
  const t = (hi, en) => (language === 'hi' ? hi : en)

  const [open, setOpen] = useState(() => isStoreOpen())
  const [info, setInfo] = useState(() => getNextOpenInfo())
  const [secondsLeft, setSecondsLeft] = useState(() => getNextOpenInfo().secondsUntil ?? 0)
  const [modalDismissed, setModalDismissed] = useState(false)

  useEffect(() => {
    const tick = () => {
      const nowOpen = isStoreOpen()
      setOpen(nowOpen)
      const next = getNextOpenInfo()
      setInfo(next)
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
      {/* Sticky mini banner when user dismissed full shutter */}
      {modalDismissed && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[90] px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => setModalDismissed(false)}
            className="w-full flex items-center justify-between gap-2 bg-ink text-white rounded-2xl px-3 py-2.5 shadow-pop active:scale-[0.99] transition"
          >
            <span className="text-xs font-semibold truncate">
              {t('अभी बंद है', "We're closed")}
              <span className="text-white/70"> · {hoursLabel}</span>
            </span>
            <span className="shrink-0 font-bold text-sm tabular-nums text-[#FF9800] bg-white/10 px-2.5 py-1 rounded-lg">
              {countdown}
            </span>
          </button>
        </div>
      )}

      {/* Full shutter with brand image */}
      {!modalDismissed && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-label={t('स्टोर बंद है', 'Store is closed')}
        >
          <div className="relative w-full max-w-[480px] max-h-[100dvh] overflow-hidden bg-[#1a1a1a] shadow-2xl">
            {/* Shutter image */}
            <img
              src="/store-closed-shutter.png"
              alt={t('स्टोर बंद है', 'We are closed')}
              className="w-full h-auto object-cover object-center max-h-[72dvh] sm:max-h-[75dvh]"
            />

            {/* Gradient + countdown panel over lower part of image */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent pt-16 pb-[max(1.25rem,env(safe-area-inset-bottom))] px-5">
              <div className="text-center space-y-3">
                <p className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.15em]">
                  {t('खुलने में बचा समय', 'Opens in')}
                </p>
                <div className="inline-flex items-center justify-center min-w-[160px] px-6 py-3 rounded-2xl bg-[#FF9800] text-white font-bold text-3xl tabular-nums tracking-wider shadow-lg">
                  {countdown}
                </div>
                <p className="text-white/85 text-sm font-medium">
                  {language === 'hi' ? info.labelHi : info.labelEn}
                </p>
                <p className="text-white/55 text-xs">
                  {t('ऑर्डर समय', 'Order hours')}: {hoursLabel}
                </p>
                <button
                  type="button"
                  onClick={() => setModalDismissed(true)}
                  className="mt-1 w-full max-w-xs mx-auto block bg-white text-ink font-bold py-3.5 rounded-2xl active:scale-[0.98] transition shadow-pop"
                >
                  {t('मेन्यू देखें', 'Browse menu')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
