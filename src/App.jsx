import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import AppLayout from '@/components/AppLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ExpiryGuard from '@/pages/ExpiryGuard'
import DistribusiTrack from '@/pages/DistribusiTrack'
import ApprovalFlow from '@/pages/ApprovalFlow'
import { useAuth } from '@/store/AuthContext'

function RequireAuth({ children }) {
  const { user, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// transisi halaman ada di AppLayout, jangan bungkus Routes pakai
// AnimatePresence lagi (halaman jadi blank)
export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stok" element={<ExpiryGuard />} />
        <Route path="/distribusi" element={<DistribusiTrack />} />
        <Route path="/approval" element={<ApprovalFlow />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
