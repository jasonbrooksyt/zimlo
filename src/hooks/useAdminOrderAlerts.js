import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '../store/useStore'

/**
 * Admin-only: detects newly arrived orders/enquiries (via live orders store)
 * and fires browser notification + short beep + in-app toast.
 */
export function useAdminOrderAlerts(enabled = true) {
  const orders = useStore((s) => s.orders)
  const knownIds = useRef(new Set())
  const seeded = useRef(false)
  const [toast, setToast] = useState(null)
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.value = 0.08
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.stop(ctx.currentTime + 0.4)
      setTimeout(() => ctx.close(), 500)
    } catch {
      /* ignore */
    }
  }, [])

  const describe = (order) => {
    const isEnquiry =
      order.paymentMethodPreference === 'enquiry' ||
      [
        'tiffin',
        'plumber',
        'electrician',
        'carpenter',
        'fabrication',
        'mechanic',
        'transport',
        'other-service'
      ].includes(order.category || order.type)
    const kind = isEnquiry ? 'New enquiry' : 'New order'
    const cat = (order.category || order.type || 'order').toString()
    const who = order.customerName || order.customerPhone || ''
    return {
      title: `${kind}: ${cat}`,
      body: who ? `${who} — open Admin to review` : 'Open Admin to review',
      kind,
      order
    }
  }

  const notify = useCallback(
    (order) => {
      const { title, body } = describe(order)
      playBeep()
      setToast({ title, body, id: order.id, at: Date.now() })
      setTimeout(() => setToast((t) => (t?.id === order.id ? null : t)), 8000)

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          const n = new Notification(title, {
            body,
            icon: '/logo.png',
            badge: '/favicon-32.png',
            tag: `order-${order.id}`,
            renotify: true
          })
          n.onclick = () => {
            window.focus()
            n.close()
          }
        } catch {
          /* ignore */
        }
      }
    },
    [playBeep]
  )

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied'
    try {
      const p = await Notification.requestPermission()
      setPermission(p)
      return p
    } catch {
      setPermission('denied')
      return 'denied'
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    if (!seeded.current) {
      orders.forEach((o) => knownIds.current.add(o.id))
      seeded.current = true
      return
    }
    for (const o of orders) {
      if (!knownIds.current.has(o.id)) {
        knownIds.current.add(o.id)
        notify(o)
      }
    }
  }, [orders, enabled, notify])

  const dismissToast = () => setToast(null)

  return { toast, dismissToast, permission, requestPermission }
}
