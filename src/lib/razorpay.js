// Zimlo — Razorpay checkout helpers (frontend side).
// Talks to our own /api/create-razorpay-order and /api/verify-razorpay-payment
// serverless functions — never touches the Razorpay Secret Key directly.
//
// We send `items` (dish id + qty), not a price — the server looks up real
// prices itself and returns the authoritative `pricing` breakdown, which
// the caller must use when inserting the order row (it's the only version
// the DB pricing trigger will accept). See api/create-razorpay-order.js.

let scriptLoadingPromise = null

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptLoadingPromise) return scriptLoadingPromise

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Could not load Razorpay checkout'))
    document.body.appendChild(script)
  })
  return scriptLoadingPromise
}

// Runs the full online-payment flow: price it server-side -> create order
// -> open Razorpay checkout -> verify signature. Resolves with
// { paymentId, orderId, pricing } on success — `pricing` is the
// server-computed { subtotal, discount, deliveryFee, codFee, total } and
// must be used as-is when writing the order row afterwards. Rejects with
// an Error (including the user simply closing the checkout popup, which is
// not really an "error" but is treated as one here so callers can stop
// their loading state either way).
export async function payWithRazorpay({ items, couponCode, paymentMethod, customerPhone, hasReferral, orderId, name, contact }) {
  await loadRazorpayScript()

  const createRes = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items,
      couponCode,
      paymentMethod,
      customerPhone,
      hasReferral,
      orderId,
      receipt: orderId || `zimlo-${Date.now()}`
    })
  })
  const createData = await createRes.json()
  if (!createRes.ok) throw new Error(createData.error || 'Could not start payment')

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: createData.keyId,
      amount: createData.amount,
      currency: 'INR',
      name: 'Zimlo',
      image: 'https://zimlo.in/icons/icon-192.png',
      description: orderId ? orderId : `${items.length} item(s)`,
      order_id: createData.orderId,
      prefill: { name, contact },
      theme: { color: '#FF9800' },
      handler: async (response) => {
        try {
          const verifyRes = await fetch('/api/verify-razorpay-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          })
          const verifyData = await verifyRes.json()
          if (!verifyRes.ok || !verifyData.verified) {
            reject(new Error('Payment could not be verified'))
            return
          }
          resolve({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            pricing: createData.pricing
          })
        } catch (err) {
          reject(new Error('Payment could not be verified'))
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled'))
      }
    })
    razorpay.on('payment.failed', () => reject(new Error('Payment failed')))
    razorpay.open()
  })
}
