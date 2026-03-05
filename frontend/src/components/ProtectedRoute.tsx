import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = false // will hook to Supabase auth soon
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />
}