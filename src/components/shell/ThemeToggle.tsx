import { useSettings } from '../../hooks'

/**
 * Two-state segmented LIGHT / DARK toggle. The 'system' option is honored
 * everywhere `useSettings` is read but is intentionally not surfaced here —
 * it lives in /kbw-notes/settings as the third segmented option.
 *
 * Selected: ink fill, paper text. Unselected: transparent, muted text.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useSettings()
  const isDark = resolvedTheme === 'dark'

  return (
    <div
      className="inline-flex items-center"
      style={{
        height: 28,
        border: '1px solid var(--color-hair)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
      role="group"
      aria-label="Theme"
    >
      {(['light', 'dark'] as const).map((value) => {
        const selected = (value === 'dark') === isDark
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-xs)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '0 12px',
              height: '100%',
              background: selected ? 'var(--color-ink)' : 'transparent',
              color: selected ? 'var(--color-paper)' : 'var(--color-ink-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 100ms ease, color 100ms ease',
            }}
            aria-pressed={selected}
          >
            {value}
          </button>
        )
      })}
    </div>
  )
}
