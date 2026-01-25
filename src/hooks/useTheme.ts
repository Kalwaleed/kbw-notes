import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

const VALID_THEMES: Theme[] = ['light', 'dark']

/**
 * Validate theme value from localStorage
 * Only accepts 'light' or 'dark', falls back to system preference
 */
function validateTheme(value: unknown): Theme | null {
  if (typeof value === 'string' && VALID_THEMES.includes(value as Theme)) {
    return value as Theme
  }
  return null
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first with validation
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      const validated = validateTheme(stored)
      if (validated) return validated

      // Invalid value stored - clear it
      if (stored !== null) {
        localStorage.removeItem('theme')
      }

      // Fall back to system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set a preference
      const stored = localStorage.getItem('theme')
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return { theme, setTheme, toggleTheme }
}
