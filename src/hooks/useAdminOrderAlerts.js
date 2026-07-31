import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '../store/useStore'

/**
 * Admin panel alerts when a new order/enquiry appears in the live orders list.
 * Requires: Admin page open + (optional) browser notification permission.
 * Telegram covers alerts when the Admin tab is closed.
 */
export function useAdminOrderAlerts(enabled = true) {
  const orders = useStore((s) => s.orders)
  const ordersLoading = useStore((s) => s.ordersLoading)
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
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.12)
      gain.gain.value = 0.1
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.stop(ctx.currentTime + 0.55)
      setTimeout(() => ctx.close(), 700)
    } catch {
      /* ignore — autoplay policies */
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
      body: who ? `${who} — check Admin Orders` : 'Check Admin → Orders',
      kind
    }
  }

  const notify = useCallback(
    (order) => {
      const { title, body } = describe(order)
      playBeep()
      setToast({ title, body, id: order.id, at: Date.now() })
      window.setTimeout(() => {
        setToast((t) => (t?.id === order.id ? null : t))
      }, 10000)

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          const n = new Notification(title, {
            body,
            icon: '/logo.png',
            badge: '/favicon-32.png',
            tag: `order-${order.id}`,
            renotify: true,
            requireInteraction: false
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

  // Seed only after first real fetch finishes (avoid empty → all-as-new race)
  useEffect(() => {
    if (!enabled) return
    if (ordersLoading) return

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
  }, [orders, ordersLoading, enabled, notify])

  // Keep permission state in sync if user changes it in browser settings
  useEffect(() => {
    if (typeof Notification === 'undefined') return
    setPermission(Notification.permission)
  }, [])

  const dismissToast = () => setToast(null)

  return { toast, dismissToast, permission, requestPermission }
}
