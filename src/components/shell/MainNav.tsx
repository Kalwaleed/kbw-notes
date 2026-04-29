export interface NavItem {
  label: string
  href: string
  isActive?: boolean
}

export interface MainNavProps {
  items: NavItem[]
  onNavigate?: (href: string) => void
}

/**
 * Primary navigation. Mono voice: small caps, +0.04em tracking, accent
 * underline on hover or when active.
 */
export function MainNav({ items, onNavigate }: MainNavProps) {
  return (
    <nav className="flex items-center" style={{ gap: 'var(--space-7)' }}>
      {items.map((item) => (
        <button
          key={item.href}
          type="button"
          onClick={() => onNavigate?.(item.href)}
          className="font-mono uppercase transition-colors"
          style={{
            fontSize: 'var(--text-mono-sm)',
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: item.isActive ? 'var(--color-ink)' : 'var(--color-ink-muted)',
            textDecoration: item.isActive ? 'underline' : 'none',
            textDecorationColor: 'var(--color-accent)',
            textUnderlineOffset: '4px',
            textDecorationThickness: '1px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-ink)'
            e.currentTarget.style.textDecoration = 'underline'
          }}
          onMouseLeave={(e) => {
            if (!item.isActive) {
              e.currentTarget.style.color = 'var(--color-ink-muted)'
              e.currentTarget.style.textDecoration = 'none'
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
