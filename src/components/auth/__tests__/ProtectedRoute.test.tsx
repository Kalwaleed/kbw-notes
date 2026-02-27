import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'

// Mock useAuth with controllable returns
const mockUseAuth = vi.fn()
vi.mock('../../../hooks', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderProtected(route = '/kbw-notes/home') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<div data-testid="login">Login Page</div>} />
        <Route
          path="/kbw-notes/home"
          element={
            <ProtectedRoute>
              <div data-testid="protected">Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('shows loading spinner while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true })
    renderProtected()

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
    expect(screen.queryByTestId('login')).not.toBeInTheDocument()
  })

  it('redirects to "/" when user is null and not loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    renderProtected()

    expect(screen.getByTestId('login')).toBeInTheDocument()
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u-1', email: 'test@kbw.vc' }, isLoading: false })
    renderProtected()

    expect(screen.getByTestId('protected')).toBeInTheDocument()
    expect(screen.queryByTestId('login')).not.toBeInTheDocument()
  })

  it('preserves location state on redirect', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })

    let capturedState: unknown
    render(
      <MemoryRouter initialEntries={['/kbw-notes/home']}>
        <Routes>
          <Route
            path="/"
            element={
              <StateCapture onCapture={(s) => { capturedState = s }} />
            }
          />
          <Route
            path="/kbw-notes/home"
            element={
              <ProtectedRoute>
                <div>Protected</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(capturedState).toEqual({ from: '/kbw-notes/home' })
  })
})

// Helper component to capture location state
import { useLocation } from 'react-router-dom'

function StateCapture({ onCapture }: { onCapture: (state: unknown) => void }) {
  const location = useLocation()
  onCapture(location.state)
  return <div data-testid="login">Login</div>
}
