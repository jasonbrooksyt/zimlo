import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COD_FEE, DELIVERY_FEE } from '../data/menuData'

// Zimlo — single global store using Zustand.
// Persisted to localStorage so a customer's cart/login/orders survive a
// page refresh — important on flaky small-town mobile networks where
// people often reload rather than wait.

let orderCounter = 1000

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
      logout: () => set({ user: null, isAuthenticated: false, cart: [] }),

      // ---------------- ADMIN AUTH (separate, simple gate) ----------------
      isAdminAuthenticated: false,
      adminLogin: (username, password) => {
        // Dummy credentials for demo purposes only.
        if (username === 'admin' && password === 'zimlo123') {
          set({ isAdminAuthenticated: true })
          return true
        }
        return false
      },
      adminLogout: () => set({ isAdminAuthenticated: false }),

      // ---------------- CART ----------------
      // Cart items only apply to the Food flow (priced dishes).
      // Bakery/Grocery/Medicine/Parcel/Custom go through a request form instead.
      cart: [],

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

      clearCart: () => set({ cart: [] }),

      cartSubtotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.qty, 0)
      },

      cartItemCount: () => {
        return get().cart.reduce((sum, item) => sum + item.qty, 0)
      },

      // Given a payment method, returns the final payable total.
      // COD adds a flat convenience fee; online payment stays at list price.
      calculateTotal: (paymentMethod) => {
        const subtotal = get().cartSubtotal()
        if (subtotal === 0) return 0
        const codFee = paymentMethod === 'cod' ? COD_FEE : 0
        return subtotal + DELIVERY_FEE + codFee
      },

      // ---------------- ORDERS ----------------
      orders: [],

      // Places a Food order built from the current cart.
      placeFoodOrder: ({ paymentMethod, address, notes }) => {
        const { cart, cartSubtotal, calculateTotal, user } = get()
        if (cart.length === 0) return null
        const order = {
          id: `ZM${orderCounter++}`,
          type: 'food',
          items: cart,
          subtotal: cartSubtotal(),
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
        set({ orders: [order, ...get().orders], cart: [] })
        return order
      },

      // Places a "request" order (Bakery/Grocery/Medicine/Parcel/Custom).
      // No price yet — admin sets it manually after reviewing the request.
      placeRequestOrder: ({ category, requirement, address, paymentMethodPreference }) => {
        const { user } = get()
        const order = {
          id: `ZM${orderCounter++}`,
          type: category, // 'bakery' | 'grocery' | 'medicine' | 'parcel' | 'custom'
          requirement,
          address,
          paymentMethodPreference, // customer's preference, admin can confirm/override
          total: null, // admin will set this
          status: 'placed',
          customerPhone: user?.phone || 'guest',
          createdAt: new Date().toISOString(),
          priceConfirmed: false
        }
        set({ orders: [order, ...get().orders] })
        return order
      },

      // Admin action: set/confirm price for a request-based order.
      setOrderPrice: (orderId, price, paymentMethod) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  total:
                    paymentMethod === 'cod' ? Number(price) + COD_FEE : Number(price),
                  codFee: paymentMethod === 'cod' ? COD_FEE : 0,
                  paymentMethod,
                  priceConfirmed: true
                }
              : o
          )
        })
      },

      // Admin action: advance order status.
      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((o) => (o.id === orderId ? { ...o, status } : o))
        })
      },

      getOrderById: (orderId) => get().orders.find((o) => o.id === orderId),

      // ---------------- LANGUAGE ----------------
      language: 'hi', // 'hi' | 'en' — Hindi shown by default per brand tagline
      toggleLanguage: () =>
        set({ language: get().language === 'hi' ? 'en' : 'hi' })
    }),
    {
      name: 'zimlo-storage' // localStorage key
    }
  )
)
