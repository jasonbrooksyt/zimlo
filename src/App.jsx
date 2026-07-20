import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute'

// Customer pages
import Login from './pages/Login'
import Home from './pages/Home'
import FoodSubcategories from './pages/FoodSubcategories'
import DishList from './pages/DishList'
import RequestForm from './pages/RequestForm'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import Orders from './pages/Orders'
import Profile from './pages/Profile'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

// Zimlo route map.
// Browsing (Home, category, dish list, cart) is open to everyone — no login
// wall on entry, matching familiar Zomato/Swiggy-style UX. Login (OTP) is
// only required at the point of actually placing an order: Food checkout,
// or submitting a Bakery/Grocery/Medicine/Parcel/Custom request. Order
// history, tracking, and profile also require login since they're tied to
// a specific customer.
export default function App() {
  return (
    <Routes>
      {/* Open browsing — no auth required */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/food" element={<FoodSubcategories />} />
      <Route path="/food/:subId" element={<DishList />} />
      <Route path="/cart" element={<Cart />} />

      <Route path="/login" element={<Login />} />

      {/* Auth required — these are the actual "place an order" actions */}
      <Route path="/request/:categoryId" element={<ProtectedRoute><RequestForm /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/track/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

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
  )
}
