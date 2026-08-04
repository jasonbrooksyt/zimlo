// Zimlo — SSR entry, used ONLY by scripts/prerender.mjs at build time.
// Not part of the client bundle (built separately via `vite build --ssr`,
// see package.json's `build:ssr` script). Renders a route to a static HTML
// string so crawlers and link-preview bots (Google, WhatsApp, Telegram)
// get real content in the initial response instead of an empty <div id=
// "root"> — see index.html / the SPA-only setup this replaces for the
// routes listed in scripts/prerender.mjs.
//
// This is intentionally NOT full SSR (no per-request server, no data
// fetching on the server) — it's a build-time prerender of the public,
// data-light marketing/browse routes. Routes behind login, and anything
// that depends on a live Supabase session (Checkout, Orders, Profile,
// Admin) are explicitly NOT in the prerender list and keep working exactly
// as before: pure client-rendered SPA after the JS bundle loads.
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App.jsx'

// Per-route SEO metadata. Kept here (not scattered per-page) so
// scripts/prerender.mjs has one place to read title/description/canonical
// from when it writes each dist/<route>/index.html.
export const ROUTE_META = {
  '/': {
    title: 'Zimlo - Jo Chaho, Jahan Chaho, Zimlo Laayega',
    description: 'Zimlo - hyperlocal on-demand delivery for Pilukhedi & Kurawar: food, grocery, medicine, parcels and home services.'
  },
  '/home': {
    title: 'Zimlo - Jo Chaho, Jahan Chaho, Zimlo Laayega',
    description: 'Zimlo - hyperlocal on-demand delivery for Pilukhedi & Kurawar: food, grocery, medicine, parcels and home services.'
  },
  '/food': {
    title: 'Order Food Online - Zimlo',
    description: 'Order food online from local restaurants — Fast Food, North Indian, South Indian, Chinese, Pizza, Thali and more, delivered by Zimlo.'
  },
  '/services': {
    title: 'Home Services - Electrician, Plumber, Carpenter & More | Zimlo',
    description: 'Book trusted local home services on Zimlo — electrician, plumber, carpenter, appliance technician, and transport, with confirmed pricing.'
  },
  '/about': {
    title: 'About Us - Zimlo',
    description: 'Zimlo is a local delivery platform serving Pilukhedi and Kurawar — food, grocery, medicine, and more, delivered quickly and reliably.'
  },
  '/contact': {
    title: 'Contact Us - Zimlo',
    description: 'Get in touch with Zimlo for order help, questions, or feedback — WhatsApp, email, or Instagram.'
  },
  '/privacy-policy': {
    title: 'Privacy Policy - Zimlo',
    description: 'How Zimlo collects, uses, and protects your information when you order food, grocery, medicine or other deliveries.'
  },
  '/refund-policy': {
    title: 'Refund & Cancellation Policy - Zimlo',
    description: 'Zimlo\'s policy on order cancellations and refunds for Cash on Delivery and online (Razorpay) payments.'
  },
  '/terms': {
    title: 'Terms & Conditions - Zimlo',
    description: 'The terms that apply when you use Zimlo to order food, grocery, medicine, parcels or home services.'
  },
  '/delivery-policy': {
    title: 'Shipping & Delivery Policy - Zimlo',
    description: 'Zimlo\'s delivery coverage area, timelines, and delivery fees for Pilukhedi and Kurawar.'
  }
}

export function render(url) {
  const html = renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  )
  return { html, meta: ROUTE_META[url] }
}
