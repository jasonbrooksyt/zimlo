// Zimlo — Vercel Serverless Function.
// Verifies a completed Razorpay payment's signature server-side, using
// the SECRET key — this is what actually confirms the payment is real and
// wasn't tampered with client-side. The frontend calls this right after
// Razorpay's checkout succeeds, BEFORE placing the order in the app.

import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return res.status(500).json({ error: 'Razorpay is not configured on the server yet' })
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  const isValid = expectedSignature === razorpay_signature
  if (!isValid) {
    return res.status(400).json({ verified: false, error: 'Payment signature mismatch' })
  }

  return res.status(200).json({ verified: true })
}
