// Zimlo — server-side pricing recompute, shared by API routes.
// Mirrors supabase/order-pricing-integrity.sql. If you change a fee
// constant here, change it in that SQL file too (and vice versa) — the
// DB trigger is the real backstop, this is what makes the Razorpay charge
// itself correct instead of just getting rejected after payment.

export const COD_FEE = 20
export const DELIVERY_FEE = 19
export const FREE_DELIVERY_THRESHOLD = 999
export const REFERRAL_DELIVERY_DISCOUNT = 20
export const MIN_ORDER_AMOUNT = 199

// items: [{ id, qty }]. Looks up real prices from `dishes`, ignoring
// whatever price the client attached to the cart item.
export async function computeOrderPricing(supabaseAdmin, { items, couponCode, paymentMethod, customerPhone, hasReferral }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty')
  }

  const ids = items.map((i) => i.id)
  const { data: dishes, error: dishError } = await supabaseAdmin
    .from('dishes')
    .select('id, price')
    .in('id', ids)
  if (dishError) throw new Error('Could not verify item prices')

  const priceById = new Map(dishes.map((d) => [d.id, d.price]))
  let subtotal = 0
  for (const { id, qty } of items) {
    const price = priceById.get(id)
    if (price == null) throw new Error(`Unknown item: ${id}`)
    const quantity = Number(qty)
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error(`Invalid quantity for ${id}`)
    subtotal += price * quantity
  }

  if (subtotal < MIN_ORDER_AMOUNT) {
    throw new Error(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}`)
  }

  let discount = 0
  if (couponCode) {
    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('active', true)
      .maybeSingle()
    if (!coupon) throw new Error('Invalid coupon code')
    if (subtotal < coupon.min_order) throw new Error('Order does not meet coupon minimum')
    discount = coupon.type === 'flat'
      ? coupon.value
      : Math.min(Math.round((subtotal * coupon.value) / 100), coupon.max_discount ?? Infinity)
  }

  let deliveryFee = 0
  if (subtotal < FREE_DELIVERY_THRESHOLD) {
    deliveryFee = DELIVERY_FEE
    // Still trusts the client's "I came via a referral link" claim
    // (hasReferral) — that part isn't closed, see the KNOWN GAP note in
    // supabase/order-pricing-integrity.sql. What IS closed: a repeat
    // customer claiming it more than once (real server-side check below).
    if (hasReferral && customerPhone) {
      const { count } = await supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('customer_phone', customerPhone)
        .eq('type', 'food')
      if ((count ?? 0) === 0) {
        deliveryFee = Math.max(DELIVERY_FEE - REFERRAL_DELIVERY_DISCOUNT, 0)
      }
    }
  }

  const codFee = paymentMethod === 'cod' ? COD_FEE : 0
  const total = Math.max(subtotal - discount, 0) + deliveryFee + codFee

  return { subtotal, discount, deliveryFee, codFee, total }
}

// Request-based orders (Grocery/Parcel/Medicine/Custom/Services) have no
// cart — an admin quotes a fixed price after the fact (setOrderPrice),
// stored in orders.total, an update only a real (non-anonymous) admin
// session can make (see "Only real admins can update orders" RLS policy).
// So for the "Pay Now" flow on OrderTracking, the trusted amount is
// whatever is already sitting in that row — NOT a number the client sends.
// This still has to be read server-side (not trusted from the client's
// local store) because a customer could otherwise open devtools and
// override their local copy of order.total before hitting Pay Now.
export async function getQuotedOrderAmount(supabaseAdmin, orderId) {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('total, price_confirmed, quote_accepted, paid, type')
    .eq('id', orderId)
    .maybeSingle()

  if (error || !order) throw new Error('Order not found')
  if (order.type === 'food') throw new Error('Use the cart pricing flow for food orders')
  if (!order.price_confirmed) throw new Error('This order has not been priced yet')
  if (!order.quote_accepted) throw new Error('Please accept the quote before paying')
  if (order.paid) throw new Error('This order is already paid')
  if (!order.total || order.total <= 0) throw new Error('Invalid order amount')

  return { total: order.total }
}
