# Zimlo — Jo Chaho, Jahan Chaho, Zimlo Laayega

Hyperlocal on-demand delivery platform for small towns in India. Built with
React 18, Vite, Tailwind CSS, React Router, Zustand, and Supabase (live menu +
admin auth).

## Getting started (local dev)

```bash
npm install
cp .env.example .env   # then fill in your Supabase project values (see below)
npm run dev
```

Open http://localhost:5173. Login with any 10-digit mobile number starting
6-9, then any 4-digit OTP (demo mode — no real SMS is sent).

Without a `.env` file, the app still runs — Food falls back to the bundled
demo menu in `src/data/menuData.js` — but menu editing from the admin
dashboard won't work until Supabase is connected (see below).

## Setting up Supabase (live, editable menu)

This is what lets you change dish prices/names from the Admin Dashboard and
have it reflect for every customer immediately, without a code change or
redeploy.

1. **Create a project** at [supabase.com](https://supabase.com) (free tier
   is enough). Name it whatever you like, e.g. "zimlo".
2. **Run the schema**: open your project's **SQL Editor** → paste the
   contents of `supabase/schema.sql` → Run. This creates the `dishes`
   table, security rules (public read, admin-only write), and turns on
   realtime sync.
3. **Load the starter menu**: in the same SQL Editor, paste the contents of
   `supabase/seed.sql` → Run. This loads all 117 demo dishes so you're not
   starting from an empty menu.
4. **Get your API keys**: Project Settings → API → copy the **Project URL**
   and the **anon public key**.
5. **Create your admin account**: Authentication → Users → **Add user** →
   enter an email + password. This is what you'll log in with at
   `/admin/login` — there's no public admin sign-up screen by design.
6. **Set the environment variables**:
   - Locally: put them in `.env` (copied from `.env.example`)
   - On Vercel: Project → Settings → Environment Variables → add
     `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` → redeploy

Once this is done, `/admin/login` → Menu tab lets you edit/add/delete
dishes, and changes show up on customers' screens within a couple seconds
(no page refresh needed) thanks to Supabase Realtime.

## Project structure

```
src/
  components/     Header, BottomNav, CategoryCard, DishCard, CartBar,
                   SearchBar, VegToggle, route guards
  pages/          Login, Home, Food flow, Cart, Checkout, Orders, Tracking, Profile
  pages/admin/    AdminLogin, AdminDashboard, MenuManagement
  store/          useStore.js — Zustand store (auth, cart, coupons, orders)
  hooks/          useDishes.js — live Supabase-backed menu data + realtime sync
  lib/            supabaseClient.js, dishMeta.js (deterministic rating/bestseller tags)
  data/           menuData.js — bundled demo dishes (used as offline fallback
                   and as the seed source for Supabase)
supabase/
  schema.sql      Table + Row Level Security + realtime setup
  seed.sql        Starter menu (generated from src/data/menuData.js)
scripts/
  generate-seed.mjs   Regenerates supabase/seed.sql from menuData.js
```

## Business rules encoded in the app

- **Food** category shows only priced dishes, grouped by 11 subcategories
  (Fast Food, North Indian, South Indian, Chinese, Bakery Items, Beverages,
  Pizza, Rolls & Wraps, Thali & Combos, Street Food, Desserts) — no
  restaurant/hotel names anywhere in the UI.
- **Bakery, Grocery, Medicine, Parcel, Custom Order** use a free-text
  request form instead of a priced catalogue. The admin sets the price
  manually from the dashboard after reviewing the request.
- **Cash on Delivery** adds a flat ₹20 convenience fee on top of the order
  total, applied consistently at Food checkout and at request-order price
  confirmation.
- Browsing (Home, Food categories, dish lists, cart) is open to everyone —
  OTP login is only required when actually placing an order (Checkout, or
  submitting a Bakery/Grocery/Medicine/Parcel/Custom request).
- Hindi is the default language; every screen has an English toggle.

## Admin dashboard

`/admin/login` (Supabase Auth — create the user from the Supabase
dashboard, see setup steps above).

- **Orders tab** — set prices on request-based orders, move any order
  through delivery stages.
- **Menu tab** — add, edit, or delete Food dishes live. Requires Supabase
  to be configured (see above); otherwise this tab shows a setup notice
  instead of crashing.

## Notes for going further

- Replace the dummy OTP flow in `Login.jsx` with a real SMS gateway
  (e.g. MSG91, Twilio Verify).
- Orders currently live in `localStorage` via Zustand's `persist` — move
  them to a Supabase table (same pattern as `dishes`) so the Admin Orders
  tab is live across devices too, not just the menu.
- Wire `paymentMethod === 'online'` to an actual payment gateway
  (Razorpay/PayU/Cashfree are common choices for Indian merchants).
