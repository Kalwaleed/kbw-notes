export interface NavItem {
  label: string
  href: string
  isActive?: boolean
}

export interface MainNavProps {
  items: NavItem[]
  onNavigate?: (href: string) => void
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  return (
    <nav className="flex items-center gap-6">
      {items.map((item) => (
        <button
          key={item.href}
          onClick={() => onNavigate?.(item.href)}
          className={`
            text-sm font-medium transition-colors
            ${
              item.isActive
                ? 'text-violet-600 dark:text-violet-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400'
            }
          `}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
