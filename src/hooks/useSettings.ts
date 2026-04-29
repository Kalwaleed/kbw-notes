import { useState, useEffect, useCallback } from 'react'
import type {
  AppearanceSettings,
  ReadingSettings,
  Theme,
  SortOrder,
  PostsPerPage,
} from '../components/settings/types'
import {
  defaultAppearanceSettings,
  defaultReadingSettings,
} from '../components/settings/types'

const THEME_STORAGE_KEY = 'kbw-theme'
const READING_STORAGE_KEY = 'kbw-reading-settings'
const LEGACY_APPEARANCE_KEY = 'kbw-appearance-settings'
const LEGACY_THEME_KEY = 'theme'

// Valid values for settings validation
const VALID_THEMES: Theme[] = ['light', 'dark', 'system']
const VALID_SORT_ORDERS: SortOrder[] = ['newest', 'oldest', 'popular']
const VALID_POSTS_PER_PAGE: PostsPerPage[] = [6, 12, 24]

function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && VALID_THEMES.includes(value as Theme)
}

/**
 * Validate and sanitize reading settings from localStorage
 */
function validateReadingSettings(data: unknown, defaults: ReadingSettings): ReadingSettings {
  if (typeof data !== 'object' || data === null) {
    return defaults
  }

  const raw = data as Record<string, unknown>

  return {
    defaultSort: VALID_SORT_ORDERS.includes(raw.defaultSort as SortOrder) ? (raw.defaultSort as SortOrder) : defaults.defaultSort,
    postsPerPage: VALID_POSTS_PER_PAGE.includes(raw.postsPerPage as PostsPerPage) ? (raw.postsPerPage as PostsPerPage) : defaults.postsPerPage,
    autoExpandComments: typeof raw.autoExpandComments === 'boolean' ? raw.autoExpandComments : defaults.autoExpandComments,
  }
}

/**
 * One-time migration: prior versions stored an object under
 * "kbw-appearance-settings" containing { theme, fontSize, density }.
 * Newer storage holds a plain theme string under "kbw-theme".
 */
function loadThemeFromStorage(defaultValue: Theme): Theme {
  if (typeof window === 'undefined') return defaultValue

  try {
    const direct = localStorage.getItem(THEME_STORAGE_KEY)
    if (isTheme(direct)) return direct

    // Legacy: object form with .theme
    const appearanceLegacy = localStorage.getItem(LEGACY_APPEARANCE_KEY)
    if (appearanceLegacy) {
      try {
        const parsed = JSON.parse(appearanceLegacy)
        const candidate = (parsed as { theme?: unknown })?.theme
        if (isTheme(candidate)) {
          localStorage.setItem(THEME_STORAGE_KEY, candidate)
          localStorage.removeItem(LEGACY_APPEARANCE_KEY)
          return candidate
        }
      } catch {
        localStorage.removeItem(LEGACY_APPEARANCE_KEY)
      }
    }

    // Legacy-er: a raw "theme" key with "light" or "dark"
    const oldest = localStorage.getItem(LEGACY_THEME_KEY)
    if (oldest === 'dark' || oldest === 'light') {
      localStorage.setItem(THEME_STORAGE_KEY, oldest)
      localStorage.removeItem(LEGACY_THEME_KEY)
      return oldest
    }
  } catch {
    // Storage unavailable — fall through to default
  }

  return defaultValue
}

function loadReadingFromStorage(key: string, defaultValue: ReadingSettings): ReadingSettings {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      return validateReadingSettings(parsed, defaultValue)
    }
  } catch {
    localStorage.removeItem(key)
  }
  return defaultValue
}

function saveTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage error — silently fail
  }
}

function saveReading(value: ReadingSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(READING_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Storage error — silently fail
  }
}

export function useSettings() {
  const [theme, setThemeState] = useState<Theme>(() =>
    loadThemeFromStorage(defaultAppearanceSettings.theme)
  )

  const [reading, setReadingState] = useState<ReadingSettings>(() =>
    loadReadingFromStorage(READING_STORAGE_KEY, defaultReadingSettings)
  )

  // Apply theme to <html>; honor system preference when theme === 'system'.
  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (current: Theme) => {
      if (current === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', systemDark)
      } else {
        root.classList.toggle('dark', current === 'dark')
      }
    }

    applyTheme(theme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') applyTheme('system')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Persist
  useEffect(() => { saveTheme(theme) }, [theme])
  useEffect(() => { saveReading(reading) }, [reading])

  // Resolve effective theme (handles 'system' → actual value)
  const resolvedTheme: 'light' | 'dark' = theme === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme

  const appearance: AppearanceSettings = { theme }

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'dark') return 'light'
      if (prev === 'light') return 'dark'
      // 'system' → flip to the opposite of what's currently shown
      const systemDark = typeof window !== 'undefined'
        && window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemDark ? 'light' : 'dark'
    })
  }, [])

  const setDefaultSort = useCallback((defaultSort: SortOrder) => {
    setReadingState((prev) => ({ ...prev, defaultSort }))
  }, [])

  const setPostsPerPage = useCallback((postsPerPage: PostsPerPage) => {
    setReadingState((prev) => ({ ...prev, postsPerPage }))
  }, [])

  const setAutoExpandComments = useCallback((autoExpandComments: boolean) => {
    setReadingState((prev) => ({ ...prev, autoExpandComments }))
  }, [])

  return {
    appearance,
    resolvedTheme,
    setTheme,
    toggleTheme,
    reading,
    setDefaultSort,
    setPostsPerPage,
    setAutoExpandComments,
  }
}
