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
// Customer flow lives at the root; admin flow is fully isolated under /admin
// with its own login/auth gate, as required by the brief.
export default function App() {
  return (
    <Routes>
      {/* Default -> login (or home if already authenticated, handled inside Login/ProtectedRoute flow) */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Customer routes — require OTP login */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/food" element={<ProtectedRoute><FoodSubcategories /></ProtectedRoute>} />
      <Route path="/food/:subId" element={<ProtectedRoute><DishList /></ProtectedRoute>} />
      <Route path="/request/:categoryId" element={<ProtectedRoute><RequestForm /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
