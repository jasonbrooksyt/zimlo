import { useEffect } from 'react'

// Detects a shared Zimlo link (e.g. zimlo.in/home?ref=1) on first load and
// remembers it — see useStore's deliveryFeeAmount(), which applies
// REFERRAL_DELIVERY_DISCOUNT to a first-time customer's delivery fee if
// this flag is set. Cleared automatically after their first order places.
export function useReferralTracking() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('ref')) {
      localStorage.setItem('zimlo_referral_pending', 'true')
    }
  }, [])
}
