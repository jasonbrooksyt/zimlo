// Zimlo — Vercel Serverless Function.
// Creates a Razorpay order server-side (needs the SECRET key, which must
// never reach the browser). The frontend calls this first, gets back an
// order_id, then opens Razorpay's checkout with that order_id.
//
// SECURITY: this used to accept a client-computed `amount` directly and
// trust it — meaning anyone could edit the cart price in devtools and pay
// ₹1 for a real order. It now accepts `items` (dish id + qty) and
// recomputes the amount itself from the `dishes` table via a service-role
// Supabase client, the same way supabase/order-pricing-integrity.sql does
// for the DB insert. The client can no longer choose what it pays.
//
// Required Vercel env vars (Project Settings -> Environment Variables,
// NOT prefixed with VITE_ so they never get bundled into client code):
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//   SUPABASE_SERVICE_ROLE_KEY   (Supabase Dashboard -> Settings -> API -> service_role)
// Also needs VITE_SUPABASE_URL (already set for the client — safe to reuse,
// the project URL isn't secret; only the service role key is).

import { createClient } from '@supabase/supabase-js'
import { computeOrderPricing, getQuotedOrderAmount } from './_pricing.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { items, couponCode, paymentMethod, customerPhone, hasReferral, orderId, receipt } = req.body || {}

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server pricing check is not configured yet' })
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  let pricing
  try {
    pricing = orderId
      // Paying an already-quoted request order (Grocery/Parcel/Medicine/
      // Custom/Services) — amount comes from the admin-set DB row.
      ? await getQuotedOrderAmount(supabaseAdmin, orderId)
      // Paying a food cart — amount is recomputed from real dish prices.
      : await computeOrderPricing(supabaseAdmin, { items, couponCode, paymentMethod, customerPhone, hasReferral })
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Could not price this order' })
  }

  if (pricing.total <= 0) {
    return res.status(400).json({ error: 'Invalid order amount' })
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
        amount: Math.round(pricing.total * 100), // Razorpay wants paise, not rupees
        currency: 'INR',
        receipt: receipt || `zimlo-${Date.now()}`
      })
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.description || 'Razorpay order creation failed' })
    }

    // key_id is safe to send back — it's the PUBLIC key, needed by the
    // frontend to open the checkout widget. pricing is returned so the
    // frontend uses the SAME authoritative numbers when it inserts the
    // order row afterwards (must match what the pricing trigger expects).
    return res.status(200).json({ orderId: data.id, amount: data.amount, keyId, pricing })
  } catch (err) {
    return res.status(500).json({ error: 'Could not reach Razorpay' })
  }
}
