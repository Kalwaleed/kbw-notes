import { useState, useRef, useEffect } from 'react'

export interface User {
  name: string
  avatarUrl?: string
}

export interface UserMenuProps {
  user: User
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function UserMenu({ user, onNavigate, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get initials for avatar fallback
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-violet-600 dark:bg-violet-500 flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
            <p
              className="text-sm font-medium text-slate-900 dark:text-white"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {user.name}
            </p>
          </div>

          {/* Menu Items */}
          <button
            onClick={() => {
              setIsOpen(false)
              onNavigate?.('/profile')
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Profile
          </button>
          <button
            onClick={() => {
              setIsOpen(false)
              onNavigate?.('/settings')
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Settings
          </button>
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
          <button
            onClick={() => {
              setIsOpen(false)
              onLogout?.()
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
