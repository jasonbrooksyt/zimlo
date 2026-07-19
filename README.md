# Zimlo — भूख लगी? जिमलो.

Hyperlocal on-demand delivery platform for small towns in India. Built with
React 18, Vite, Tailwind CSS, React Router, and Zustand.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. Login with any 10-digit mobile number starting
6-9, then any 4-digit OTP (demo mode — no real SMS is sent).

## Admin dashboard

Visit `/admin/login` (also linked from Profile → Admin Login).

- Username: `admin`
- Password: `zimlo123`

The admin dashboard lets you set prices on Bakery/Grocery/Medicine/Parcel/
Custom Order requests and move any order through delivery stages.

## Project structure

```
src/
  components/     Header, BottomNav, CategoryCard, DishCard, CartBar, route guards
  pages/          Login, Home, Food flow, Cart, Checkout, Orders, Tracking, Profile
  pages/admin/    AdminLogin, AdminDashboard
  store/          useStore.js — Zustand store (auth, cart, orders), persisted to localStorage
  data/           menuData.js — fake dish catalogue + config (swap for real API later)
```

## Business rules encoded in the app

- **Food** category shows only priced dishes, grouped by subcategory
  (Fast Food, North Indian, South Indian, Chinese, Bakery Items) — no
  restaurant/hotel names anywhere in the UI.
- **Bakery, Grocery, Medicine, Parcel, Custom Order** use a free-text
  request form instead of a priced catalogue. The admin sets the price
  manually from the dashboard after reviewing the request.
- **Cash on Delivery** adds a flat ₹20 convenience fee on top of the order
  total. Online payment has no extra fee. This is applied automatically
  wherever a payment method is chosen — checkout for Food, and price
  confirmation for request-based orders.
- Hindi is the default language (matches the brand tagline); every screen
  has an English toggle in the header/profile.

## Notes for going to production

- Replace `src/data/menuData.js` reads with real API calls.
- Replace the dummy OTP flow in `Login.jsx` with a real SMS gateway
  (e.g. MSG91, Twilio Verify).
- Replace `AdminLogin`'s hardcoded credentials with real authentication.
- Wire `paymentMethod === 'online'` to an actual payment gateway
  (Razorpay/PayU/Cashfree are common choices for Indian merchants).
- `zustand/persist` currently uses `localStorage`; consider syncing orders
  to a real backend/database instead.
