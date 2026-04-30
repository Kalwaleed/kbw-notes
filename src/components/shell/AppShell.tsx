import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { MainNav } from './MainNav'
import { FolioBar } from './FolioBar'
import { ThemeToggle } from './ThemeToggle'

export interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

export interface ShellUser {
  name: string
  email?: string
  avatarUrl?: string
}

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: ShellUser
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onSignIn?: () => void
  /** Hide the folio bar (e.g., on auth-only screens). Defaults to false. */
  hideFolio?: boolean
  /** Main container width. 'feed' = 1200px (default), 'wide' = 1320px,
   *  'prose' = 720px, 'auto' = no max-width (child decides). */
  containerWidth?: 'feed' | 'wide' | 'prose' | 'auto'
}

export function AppShell({
  children,
  navigationItems,
  onNavigate,
  hideFolio = false,
  containerWidth = 'feed',
}: AppShellProps) {
  const mainMaxWidth = containerWidth === 'auto'
    ? 'none'
    : containerWidth === 'wide'
      ? 'var(--container-wide)'
      : containerWidth === 'prose'
        ? 'var(--container-prose)'
        : 'var(--container-feed)'

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogoClick = () => {
    onNavigate?.('/kbw-notes/home')
  }

  const handleMobileNavigate = (href: string) => {
    setMobileMenuOpen(false)
    onNavigate?.(href)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-paper)', color: 'var(--color-ink)' }}>
      <div className="paper-grain" aria-hidden="true" />

      {!hideFolio && <FolioBar />}

      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--color-paper)',
          borderBottom: '1px solid var(--color-hair)',
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{
            maxWidth: 'var(--container-feed)',
            padding: '0 24px',
            height: 64,
          }}
        >
          {/* Wordmark */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="transition-colors"
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'var(--text-wordmark)',
              letterSpacing: '-0.015em',
              color: 'var(--color-ink)',
              fontFeatureSettings: '"ss02" 1',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
          >
            kbw Notes
          </button>

          {/* Right cluster */}
          <div className="flex items-center" style={{ gap: 'var(--space-6)' }}>
            <div className="hidden md:block">
              <MainNav items={navigationItems} onNavigate={onNavigate} />
            </div>

            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex items-center justify-center md:hidden"
              style={{
                width: 32,
                height: 32,
                background: 'transparent',
                color: 'var(--color-ink)',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile menu sheet */}
        {mobileMenuOpen && (
          <div
            className="md:hidden drawer-enter"
            style={{
              borderTop: '1px solid var(--color-hair)',
              borderBottom: '1px solid var(--color-hair)',
              background: 'var(--color-paper)',
            }}
          >
            {navigationItems.map((item, idx) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleMobileNavigate(item.href)}
                className="font-mono uppercase"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 24px',
                  fontSize: 'var(--text-mono-base)',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  color: item.isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                  background: 'transparent',
                  border: 'none',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--color-hair)',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}

          </div>
        )}
      </header>

      {/* Main */}
      <main
        className="mx-auto"
        style={{
          maxWidth: mainMaxWidth,
          padding: 'var(--space-8) 24px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {children}
      </main>
    </div>
  )
}
