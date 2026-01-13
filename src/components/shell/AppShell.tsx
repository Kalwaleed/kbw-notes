import { useState } from 'react'
import { MainNav } from './MainNav'
import { UserMenu, type User } from './UserMenu'

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
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
  onSignIn,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogoClick = () => {
    onNavigate?.('/')
  }

  const handleMobileNavigate = (href: string) => {
    setMobileMenuOpen(false)
    onNavigate?.(href)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              kbw Notes
            </button>

            {/* Navigation and User Menu */}
            <div className="flex items-center gap-6">
              {/* Desktop Navigation */}
              <div className="hidden sm:block">
                <MainNav items={navigationItems} onNavigate={onNavigate} />
              </div>

              {/* User Menu or Sign In */}
              {user ? (
                <UserMenu user={user} onNavigate={onNavigate} onLogout={onLogout} />
              ) : (
                <button
                  onClick={onSignIn}
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors shadow-sm shadow-violet-500/20"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                className="sm:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400"
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleMobileNavigate(item.href)}
                  className={`
                    block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      item.isActive
                        ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                  `}
                  style={{ fontFamily: "'Optima', 'Segoe UI', sans-serif" }}
                >
                  {item.label}
                </button>
              ))}
              {!user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onSignIn?.()
                  }}
                  className="block w-full text-center px-3 py-2.5 mt-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
