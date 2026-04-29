import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-paper)',
          color: 'var(--color-ink-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-mono-sm)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
