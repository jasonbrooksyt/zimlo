import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COD_FEE, DELIVERY_FEE } from '../data/menuData'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// Zimlo — single global store using Zustand.
// Persisted to localStorage so a customer's cart/login/orders survive a
// page refresh — important on flaky small-town mobile networks where
// people often reload rather than wait.

// Generates a short, always-unique order ID. Replaces the old in-memory
// counter, which reset to ZM1000 on every page reload and would have
// collided with real Supabase rows (id is a primary key there).
function generateOrderId() {
  return `ZM${Date.now().toString(36).toUpperCase()}`
}

// Coupon codes now live in Supabase's `coupons` table (see
// supabase/coupons-setup.sql), editable from the admin Coupons tab —
// applyCoupon queries it directly below instead of a hardcoded list.

export const useStore = create(
  persist(
    (set, get) => ({
      // ---------------- AUTH ----------------
      user: null, // { phone, name }
      isAuthenticated: false,

      // Dummy OTP login — in production this hits an SMS gateway API.
      login: (phone, name = 'Zimlo Customer') => {
        set({ user: { phone, name }, isAuthenticated: true })
      },
      logout: async () => {
        set({ user: null, isAuthenticated: false, cart: [], appliedCoupon: null })
        // Start a fresh anonymous identity so a different phone number
        // logging in on this device next doesn't inherit the previous
        // customer's order history.
        if (isSupabaseConfigured) {
          await supabase.auth.signOut()
          await supabase.auth.signInAnonymously()
        }
      },

      // ---------------- ADMIN AUTH ----------------
      // Real admin authentication now lives in Supabase Auth (see
      // AdminLogin.jsx / ProtectedRoute.jsx's AdminProtectedRoute), not
      // here — a client-side flag can't securely gate database writes.

      // ---------------- CART ----------------
      // Cart items only apply to the Food flow (priced dishes).
      // Bakery/Grocery/Medicine/Parcel/Custom go through a request form instead.
      cart: [],
      appliedCoupon: null, // { code, type, value, minOrder, maxDiscount, label } | null

      addToCart: (dish) => {
        const cart = get().cart
        const existing = cart.find((item) => item.id === dish.id)
        if (existing) {
          set({
            cart: cart.map((item) =>
              item.id === dish.id ? { ...item, qty: item.qty + 1 } : item
            )
          })
        } else {
          set({ cart: [...cart, { ...dish, qty: 1 }] })
        }
      },

      decrementItem: (dishId) => {
        const cart = get().cart
        const existing = cart.find((item) => item.id === dishId)
        if (!existing) return
        if (existing.qty <= 1) {
          set({ cart: cart.filter((item) => item.id !== dishId) })
        } else {
          set({
            cart: cart.map((item) =>
              item.id === dishId ? { ...item, qty: item.qty - 1 } : item
            )
          })
        }
      },

      removeFromCart: (dishId) => {
        set({ cart: get().cart.filter((item) => item.id !== dishId) })
      },

      clearCart: () => set({ cart: [], appliedCoupon: null }),

      cartSubtotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.qty, 0)
      },

      cartItemCount: () => {
        return get().cart.reduce((sum, item) => sum + item.qty, 0)
      },

      // Applies a coupon code against the current subtotal. Looks the code
      // up live in Supabase (falls back to "not available" if Supabase
      // isn't configured, since coupons only exist in the database now).
      // Returns { success, message } so the UI can show feedback.
      applyCoupon: async (rawCode) => {
        const code = rawCode.trim().toUpperCase()
        const subtotal = get().cartSubtotal()

        if (!isSupabaseConfigured) {
          return { success: false, message: 'Coupons need the database to be connected' }
        }

        const { data: coupon, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', code)
          .eq('active', true)
          .maybeSingle()

        if (error || !coupon) {
          return { success: false, message: 'Invalid coupon code' }
        }
        if (subtotal < coupon.min_order) {
          return {
            success: false,
            message: `Add items worth ₹${coupon.min_order - subtotal} more to use this coupon`
          }
        }
        set({
          appliedCoupon: {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minOrder: coupon.min_order,
            maxDiscount: coupon.max_discount,
            label: coupon.label
          }
        })
        return { success: true, message: 'Coupon applied!' }
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      couponDiscount: () => {
        const { appliedCoupon, cartSubtotal } = get()
        if (!appliedCoupon) return 0
        const subtotal = cartSubtotal()
        if (subtotal < appliedCoupon.minOrder) return 0
        if (appliedCoupon.type === 'flat') return appliedCoupon.value
        const pct = Math.round((subtotal * appliedCoupon.value) / 100)
        return Math.min(pct, appliedCoupon.maxDiscount || pct)
      },

      // Given a payment method, returns the final payable total.
      // COD adds a flat convenience fee; online payment stays at list price.
      // Coupon discount is subtracted from the item subtotal before fees.
      calculateTotal: (paymentMethod) => {
        const subtotal = get().cartSubtotal()
        if (subtotal === 0) return 0
        const discount = get().couponDiscount()
        const codFee = paymentMethod === 'cod' ? COD_FEE : 0
        return Math.max(subtotal - discount, 0) + DELIVERY_FEE + codFee
      },

      // ---------------- ORDERS ----------------
      // Orders live in Supabase's `orders` table (see
      // supabase/orders-setup.sql) so an admin's status/price update
      // reaches the customer's device live, and vice versa. If Supabase
      // isn't configured, falls back to local-only orders (old behaviour)
      // so the app still works for a quick preview.
      orders: [],
      ordersLoading: false,

      // Converts a Supabase row (snake_case) into the shape every page
      // already expects (camelCase) — keeps DishCard/Cart/etc unchanged.
      _mapOrderRow: (row) => ({
        id: row.id,
        type: row.type,
        items: row.items || [],
        subtotal: row.subtotal,
        discount: row.discount || 0,
        couponCode: row.coupon_code,
        deliveryFee: row.delivery_fee,
        codFee: row.cod_fee || 0,
        total: row.total,
        paymentMethod: row.payment_method,
        paymentMethodPreference: row.payment_method_preference,
        address: row.address,
        notes: row.notes || '',
        requirement: row.requirement,
        status: row.status,
        customerPhone: row.customer_phone,
        createdAt: row.created_at,
        priceConfirmed: row.price_confirmed
      }),

      // Fetches every order (admin needs all; customer screens filter to
      // their own phone number client-side — see Orders.jsx).
      fetchOrders: async () => {
        if (!isSupabaseConfigured) return
        set({ ordersLoading: true })
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data) {
          set({ orders: data.map((row) => get()._mapOrderRow(row)) })
        }
        set({ ordersLoading: false })
      },

      // Places a Food order built from the current cart.
      placeFoodOrder: async ({ paymentMethod, address, notes }) => {
        const { cart, cartSubtotal, calculateTotal, couponDiscount, appliedCoupon, user } = get()
        if (cart.length === 0) return null

        const order = {
          id: generateOrderId(),
          type: 'food',
          items: cart,
          subtotal: cartSubtotal(),
          discount: couponDiscount(),
          couponCode: appliedCoupon?.code || null,
          deliveryFee: DELIVERY_FEE,
          codFee: paymentMethod === 'cod' ? COD_FEE : 0,
          total: calculateTotal(paymentMethod),
          paymentMethod,
          address,
          notes: notes || '',
          status: 'placed',
          customerPhone: user?.phone || 'guest',
          createdAt: new Date().toISOString(),
          priceConfirmed: true // Food items already have fixed prices
        }

        if (isSupabaseConfigured) {
          const { data: authData } = await supabase.auth.getUser()
          const { error } = await supabase.from('orders').insert({
            id: order.id,
            type: order.type,
            items: order.items,
            subtotal: order.subtotal,
            discount: order.discount,
            coupon_code: order.couponCode,
            delivery_fee: order.deliveryFee,
            cod_fee: order.codFee,
            total: order.total,
            payment_method: order.paymentMethod,
            address: order.address,
            notes: order.notes,
            status: order.status,
            customer_phone: order.customerPhone,
            price_confirmed: order.priceConfirmed,
            user_id: authData?.user?.id || null
          })
          if (error) return null
          get().fetchOrders()
        } else {
          set({ orders: [order, ...get().orders] })
        }

        set({ cart: [], appliedCoupon: null })
        return order
      },

      // Places a "request" order (Bakery/Grocery/Medicine/Parcel/Custom).
      // No price yet — admin sets it manually after reviewing the request.
      placeRequestOrder: async ({ category, requirement, address, paymentMethodPreference }) => {
        const { user } = get()
        const order = {
          id: generateOrderId(),
          type: category, // 'bakery' | 'grocery' | 'medicine' | 'parcel' | 'custom'
          requirement,
          address,
          paymentMethodPreference,
          total: null,
          status: 'placed',
          customerPhone: user?.phone || 'guest',
          createdAt: new Date().toISOString(),
          priceConfirmed: false
        }

        if (isSupabaseConfigured) {
          const { data: authData } = await supabase.auth.getUser()
          const { error } = await supabase.from('orders').insert({
            id: order.id,
            type: order.type,
            requirement: order.requirement,
            address: order.address,
            payment_method_preference: order.paymentMethodPreference,
            status: order.status,
            customer_phone: order.customerPhone,
            price_confirmed: order.priceConfirmed,
            user_id: authData?.user?.id || null
          })
          if (error) return null
          get().fetchOrders()
        } else {
          set({ orders: [order, ...get().orders] })
        }
        return order
      },

      // Admin action: set/confirm price for a request-based order.
      setOrderPrice: async (orderId, price, paymentMethod) => {
        const total = paymentMethod === 'cod' ? Number(price) + COD_FEE : Number(price)
        const codFee = paymentMethod === 'cod' ? COD_FEE : 0

        if (isSupabaseConfigured) {
          const { error } = await supabase
            .from('orders')
            .update({ total, cod_fee: codFee, payment_method: paymentMethod, price_confirmed: true })
            .eq('id', orderId)
          if (error) return
          get().fetchOrders()
        } else {
          set({
            orders: get().orders.map((o) =>
              o.id === orderId ? { ...o, total, codFee, paymentMethod, priceConfirmed: true } : o
            )
          })
        }
      },

      // Admin action: advance order status.
      updateOrderStatus: async (orderId, status) => {
        if (isSupabaseConfigured) {
          const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
          if (error) return
          get().fetchOrders()
        } else {
          set({ orders: get().orders.map((o) => (o.id === orderId ? { ...o, status } : o)) })
        }
      },

      getOrderById: (orderId) => get().orders.find((o) => o.id === orderId),

      // ---------------- LANGUAGE ----------------
      language: 'hi', // 'hi' | 'en' — Hindi shown by default per brand tagline
      toggleLanguage: () =>
        set({ language: get().language === 'hi' ? 'en' : 'hi' }),

      // ---------------- DELIVERY AREA & FOOD PREFERENCE ----------------
      serviceArea: 'kurawar', // one of SERVICE_AREAS ids — where the customer is ordering from
      setServiceArea: (areaId) => set({ serviceArea: areaId }),

      vegOnly: false, // global "Veg only" browsing preference, set from Home
      toggleVegOnly: () => set({ vegOnly: !get().vegOnly })
    }),
    {
      name: 'zimlo-storage' // localStorage key
    }
  )
)
