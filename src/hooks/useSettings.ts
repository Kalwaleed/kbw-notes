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

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return { ...defaultValue, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage:`, e)
  }
  return defaultValue
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e)
  }
}

export function useSettings() {
  const [appearance, setAppearanceState] = useState<AppearanceSettings>(() =>
    loadFromStorage(APPEARANCE_STORAGE_KEY, defaultAppearanceSettings)
  )

  const [reading, setReadingState] = useState<ReadingSettings>(() =>
    loadFromStorage(READING_STORAGE_KEY, defaultReadingSettings)
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
