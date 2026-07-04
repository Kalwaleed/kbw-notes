import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { StaffLogin } from './StaffLogin'

interface RoleGuardProps {
  children: ReactNode
  /** Additionally require the reviewer (or admin) role. */
  requireReviewer?: boolean
}

/**
 * Hard auth guard for the staff self-report surface. Unlike GateGuard (a soft
 * localStorage redirect for the public site), this requires a real Supabase
 * session, and optionally the reviewer/admin role from app_metadata — the
 * same server-controlled claim the RLS policies check.
 */
export function RoleGuard({ children, requireReviewer = false }: RoleGuardProps) {
  const { user, isLoading, isReviewer, isAdmin } = useAuth()

  if (isLoading) return null

  if (!user) return <StaffLogin />

  if (requireReviewer && !isReviewer && !isAdmin) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--text-h2)',
            color: 'var(--color-ink)',
            margin: '0 0 var(--space-2)',
          }}
        >
          Not authorized
        </h1>
        <p style={{ color: 'var(--color-ink-muted)' }}>
          This page is for the report reviewer. If you believe you should have access, contact
          PK or Donya.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
