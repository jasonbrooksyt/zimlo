// Zimlo — Vercel Serverless Function.
// Creates a Razorpay order server-side (needs the SECRET key, which must
// never reach the browser). The frontend calls this first, gets back an
// order_id, then opens Razorpay's checkout with that order_id.
//
// Required Vercel env vars (Project Settings -> Environment Variables,
// NOT prefixed with VITE_ so they never get bundled into client code):
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { amount, receipt } = req.body || {}
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' })
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay is not configured on the server yet' })
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay wants paise, not rupees
        currency: 'INR',
        receipt: receipt || `zimlo-${Date.now()}`
      })
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.description || 'Razorpay order creation failed' })
    }

    // key_id is safe to send back — it's the PUBLIC key, needed by the
    // frontend to open the checkout widget.
    return res.status(200).json({ orderId: data.id, amount: data.amount, keyId })
  } catch (err) {
    return res.status(500).json({ error: 'Could not reach Razorpay' })
  }
}
