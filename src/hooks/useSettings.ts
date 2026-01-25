import { useState, useEffect, useCallback } from 'react'
import type {
  AppearanceSettings,
  ReadingSettings,
  Theme,
  FontSize,
  Density,
  SortOrder,
  PostsPerPage,
} from '../components/settings/types'
import {
  defaultAppearanceSettings,
  defaultReadingSettings,
} from '../components/settings/types'

const APPEARANCE_STORAGE_KEY = 'kbw-appearance-settings'
const READING_STORAGE_KEY = 'kbw-reading-settings'

// Valid values for settings validation
const VALID_THEMES: Theme[] = ['light', 'dark', 'system']
const VALID_FONT_SIZES: FontSize[] = ['small', 'medium', 'large']
const VALID_DENSITIES: Density[] = ['compact', 'comfortable', 'spacious']
const VALID_SORT_ORDERS: SortOrder[] = ['newest', 'oldest', 'popular']
const VALID_POSTS_PER_PAGE: PostsPerPage[] = [6, 12, 24]

/**
 * Validate and sanitize appearance settings from localStorage
 * Returns only valid values, falling back to defaults for invalid data
 */
function validateAppearanceSettings(data: unknown, defaults: AppearanceSettings): AppearanceSettings {
  if (typeof data !== 'object' || data === null) {
    return defaults
  }

  const raw = data as Record<string, unknown>

  return {
    theme: VALID_THEMES.includes(raw.theme as Theme) ? (raw.theme as Theme) : defaults.theme,
    fontSize: VALID_FONT_SIZES.includes(raw.fontSize as FontSize) ? (raw.fontSize as FontSize) : defaults.fontSize,
    density: VALID_DENSITIES.includes(raw.density as Density) ? (raw.density as Density) : defaults.density,
  }
}

/**
 * Validate and sanitize reading settings from localStorage
 * Returns only valid values, falling back to defaults for invalid data
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

function loadAppearanceFromStorage(key: string, defaultValue: AppearanceSettings): AppearanceSettings {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      return validateAppearanceSettings(parsed, defaultValue)
    }
  } catch {
    // Invalid JSON or storage error - use defaults
    localStorage.removeItem(key)
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
    // Invalid JSON or storage error - use defaults
    localStorage.removeItem(key)
  }
  return defaultValue
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage error - silently fail
  }
}

export function useSettings() {
  const [appearance, setAppearanceState] = useState<AppearanceSettings>(() =>
    loadAppearanceFromStorage(APPEARANCE_STORAGE_KEY, defaultAppearanceSettings)
  )

  const [reading, setReadingState] = useState<ReadingSettings>(() =>
    loadReadingFromStorage(READING_STORAGE_KEY, defaultReadingSettings)
  )

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (theme: Theme) => {
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', systemDark)
      } else {
        root.classList.toggle('dark', theme === 'dark')
      }
    }

    applyTheme(appearance.theme)

    // Listen for system theme changes when in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (appearance.theme === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [appearance.theme])

  // Apply font size to document
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('text-sm', 'text-base', 'text-lg')

    const sizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    }[appearance.fontSize]

    root.classList.add(sizeClass)
  }, [appearance.fontSize])

  // Apply density to document
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious')
    root.classList.add(`density-${appearance.density}`)
  }, [appearance.density])

  // Persist appearance settings
  useEffect(() => {
    saveToStorage(APPEARANCE_STORAGE_KEY, appearance)
  }, [appearance])

  // Persist reading settings
  useEffect(() => {
    saveToStorage(READING_STORAGE_KEY, reading)
  }, [reading])

  // Appearance setters
  const setTheme = useCallback((theme: Theme) => {
    setAppearanceState((prev) => ({ ...prev, theme }))
  }, [])

  const setFontSize = useCallback((fontSize: FontSize) => {
    setAppearanceState((prev) => ({ ...prev, fontSize }))
  }, [])

  const setDensity = useCallback((density: Density) => {
    setAppearanceState((prev) => ({ ...prev, density }))
  }, [])

  // Reading setters
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
    // Appearance
    appearance,
    setTheme,
    setFontSize,
    setDensity,
    // Reading
    reading,
    setDefaultSort,
    setPostsPerPage,
    setAutoExpandComments,
  }
}
