import { useState, useRef, useEffect } from 'react'

export interface User {
  name: string
  email?: string
  avatarUrl?: string
}

export interface UserMenuProps {
  user: User
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

/**
 * User dropdown — flat editorial offset shadow (no blur), hairline
 * borders, mono email below sans name. Sign-out renders in rose.
 */
export function UserMenu({ user, onNavigate, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center transition-colors"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--color-accent-tint)',
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-ui-sm)',
          fontWeight: 500,
          border: '1px solid var(--color-hair)',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`User menu for ${user.name}`}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="drawer-enter"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 8,
            width: 240,
            background: 'var(--color-paper-raised)',
            border: '1px solid var(--color-hair)',
            boxShadow: '6px 6px 0 0 var(--color-hair)',
            padding: '8px 0',
            zIndex: 50,
          }}
        >
          {/* Header row */}
          <div style={{ padding: '12px 16px' }}>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-ui-base)',
                fontWeight: 500,
                color: 'var(--color-ink)',
              }}
            >
              {user.name}
            </div>
            {user.email && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-mono-xs)',
                  color: 'var(--color-ink-soft)',
                  marginTop: 2,
                }}
              >
                {user.email}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--color-hair)' }} />

          <MenuButton
            label="Profile"
            onClick={() => {
              setIsOpen(false)
              onNavigate?.('/kbw-notes/profile')
            }}
          />
          <MenuButton
            label="Settings"
            onClick={() => {
              setIsOpen(false)
              onNavigate?.('/kbw-notes/settings')
            }}
          />

          <div style={{ borderTop: '1px solid var(--color-hair)' }} />

          <MenuButton
            label="Sign out"
            destructive
            onClick={() => {
              setIsOpen(false)
              onLogout?.()
            }}
          />
        </div>
      )}
    </div>
  )
}

function MenuButton({
  label,
  onClick,
  destructive,
}: {
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 16px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-ui-base)',
        fontWeight: 500,
        color: destructive ? 'var(--color-rose)' : 'var(--color-ink)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 100ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = destructive
          ? 'var(--color-rose-tint)'
          : 'var(--color-accent-tint)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {label}
    </button>
  )
}
