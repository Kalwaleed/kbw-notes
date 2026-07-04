import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleGuard } from '../RoleGuard'

const mockUseAuth = vi.hoisted(() => vi.fn())
vi.mock('../../hooks/useAuth', () => ({ useAuth: mockUseAuth }))
vi.mock('../StaffLogin', () => ({
  StaffLogin: () => <div data-testid="staff-login" />,
}))

const base = {
  user: null,
  session: null,
  isLoading: false,
  isAdmin: false,
  isReviewer: false,
  error: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
}

describe('RoleGuard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders nothing while auth is loading', () => {
    mockUseAuth.mockReturnValue({ ...base, isLoading: true })
    const { container } = render(<RoleGuard><p>secret</p></RoleGuard>)
    expect(container.textContent).not.toContain('secret')
  })

  it('shows the login form when signed out', () => {
    mockUseAuth.mockReturnValue(base)
    render(<RoleGuard><p>secret</p></RoleGuard>)
    expect(screen.getByTestId('staff-login')).toBeInTheDocument()
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
  })

  it('renders children for any signed-in user by default', () => {
    mockUseAuth.mockReturnValue({ ...base, user: { id: 's-1' } })
    render(<RoleGuard><p>secret</p></RoleGuard>)
    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('blocks non-reviewers when requireReviewer is set', () => {
    mockUseAuth.mockReturnValue({ ...base, user: { id: 's-1' } })
    render(<RoleGuard requireReviewer><p>reviews</p></RoleGuard>)
    expect(screen.queryByText('reviews')).not.toBeInTheDocument()
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument()
  })

  it('admits reviewers and admins when requireReviewer is set', () => {
    mockUseAuth.mockReturnValue({ ...base, user: { id: 'd-1' }, isReviewer: true })
    render(<RoleGuard requireReviewer><p>reviews</p></RoleGuard>)
    expect(screen.getByText('reviews')).toBeInTheDocument()

    mockUseAuth.mockReturnValue({ ...base, user: { id: 'k-1' }, isAdmin: true })
    render(<RoleGuard requireReviewer><p>reviews2</p></RoleGuard>)
    expect(screen.getByText('reviews2')).toBeInTheDocument()
  })
})
