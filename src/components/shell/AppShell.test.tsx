import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AppShell } from './AppShell'

describe('AppShell public reader chrome', () => {
  it('omits sign-in, sign-out, user menu, and identity routes', () => {
    const onNavigate = vi.fn()

    render(
      <AppShell
        hideFolio
        navigationItems={[
          { label: 'Home', href: '/kbw-notes/home', isActive: true },
          { label: 'Submissions', href: '/kbw-notes/submissions' },
          { label: 'Settings', href: '/kbw-notes/settings' },
        ]}
        user={{ name: 'Test User', email: 'test@kbw.vc' }}
        onNavigate={onNavigate}
        onLogout={vi.fn()}
        onSignIn={vi.fn()}
      >
        <div>Reader content</div>
      </AppShell>
    )

    expect(screen.getByText('Reader content')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^profile$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^submissions$/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getAllByRole('button', { name: /^home$/i }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /^profile$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
  })
})
