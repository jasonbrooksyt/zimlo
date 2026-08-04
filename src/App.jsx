import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute'
import { useOrdersSync } from './hooks/useOrdersSync'
import { useCustomerSession } from './hooks/useCustomerSession'
import { useReferralTracking } from './hooks/useReferralTracking'

// Customer pages
import Login from './pages/Login'
import Home from './pages/Home'
import FoodSubcategories from './pages/FoodSubcategories'
import DishList from './pages/DishList'
import RequestForm from './pages/RequestForm'
import Services from './pages/Services'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import Orders from './pages/Orders'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Addresses from './pages/Addresses'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import PrivacyPolicy from './pages/PrivacyPolicy'
import RefundPolicy from './pages/RefundPolicy'
import TermsAndConditions from './pages/TermsAndConditions'
import ShippingPolicy from './pages/ShippingPolicy'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

// Zimlo route map.
// Browsing (Home, category, dish list, cart) is open to everyone — no login
// wall on entry, matching familiar Zomato/Swiggy-style UX. Login (OTP) is
// only required at the point of actually placing an order: Food checkout,
// or submitting a Grocery/Parcel/Custom/Services request. Order
// history, tracking, and profile also require login since they're tied to
// a specific customer.
function OAuthErrorRedirect() {
  // Google OAuth failures sometimes land on /?error=identity_already_exists
  // instead of /login. Send the customer to /login with the same query so
  // Login.jsx can show a friendly message and they can retry.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('error_code') || ''
    const desc = params.get('error_description') || ''
    if (code || params.get('error')) {
      const q = window.location.search
      if (window.location.pathname === '/' || window.location.pathname === '/home') {
        window.location.replace(`/login${q}`)
      }
    }
  }, [])
  return null
}

export default function App() {
  // Ensures a real (anonymous, if not logged in as admin) Supabase identity
  // exists as early as possible — needed so order inserts can be tagged
  // with the customer's real auth.uid() for RLS privacy.
  useCustomerSession()
  useReferralTracking()
  // Keeps orders live across the whole app (customer + admin) via Supabase
  // Realtime — mounted once here so it's active regardless of route.
  useOrdersSync()

  return (
    <>
    <OAuthErrorRedirect />
    <Routes>
      {/* Open browsing — no auth required */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/food" element={<FoodSubcategories />} />
      <Route path="/food/:subId" element={<DishList />} />
      <Route path="/services" element={<Services />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/delivery-policy" element={<ShippingPolicy />} />
      {/* Filling a Grocery/Parcel/Custom/Services request is free —
          matches Food's "browse first, login only to submit" flow. The
          login check happens inside RequestForm itself, at Submit. */}
      <Route path="/request/:categoryId" element={<RequestForm />} />

      <Route path="/login" element={<Login />} />

      {/* Auth required — these are the actual "place an order" actions */}
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/track/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />

      {/* Admin routes — fully separate auth from customer login */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
    </>
  )
}
