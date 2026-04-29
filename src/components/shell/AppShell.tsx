import { useState } from 'react'
import { Bell, Menu, X } from 'lucide-react'
import { MainNav } from './MainNav'
import { UserMenu, type User } from './UserMenu'
import { FolioBar } from './FolioBar'
import { ThemeToggle } from './ThemeToggle'
import { useUnreadCount } from '../../hooks/useNotifications'

export interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: User
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
  user,
  onNavigate,
  onLogout,
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
  const { count: unreadCount } = useUnreadCount()

  const handleLogoClick = () => {
    onNavigate?.('/kbw-notes/home')
  }

  const handleMobileNavigate = (href: string) => {
    setMobileMenuOpen(false)
    onNavigate?.(href)
  }

  const handleNotificationsClick = () => {
    onNavigate?.('/kbw-notes/notifications')
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

            {user && (
              <button
                type="button"
                onClick={handleNotificationsClick}
                style={{
                  position: 'relative',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  color: 'var(--color-ink-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'background-color 100ms ease, color 100ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent-tint)'
                  e.currentTarget.style.color = 'var(--color-ink)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-ink-muted)'
                }}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell size={18} strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      minWidth: 16,
                      height: 16,
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 9999,
                      background: 'var(--color-accent)',
                      color: 'var(--color-paper)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-mono-xs)',
                      fontWeight: 600,
                      letterSpacing: 0,
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <UserMenu user={user} onNavigate={onNavigate} onLogout={onLogout} />
            ) : (
              <button
                type="button"
                onClick={() => onNavigate?.('/')}
                className="font-mono uppercase"
                style={{
                  fontSize: 'var(--text-mono-sm)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  background: 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  border: 'none',
                  borderRadius: 2,
                  padding: '10px 16px',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden"
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
