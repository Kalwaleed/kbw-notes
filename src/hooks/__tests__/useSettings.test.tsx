import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSettings } from '../useSettings'

const THEME_STORAGE_KEY = 'kbw-theme'
const READING_STORAGE_KEY = 'kbw-reading-settings'

function fireStorageEvent(key: string, newValue: string | null) {
  const event = new StorageEvent('storage', {
    key,
    newValue,
    oldValue: null,
    storageArea: localStorage,
  })
  window.dispatchEvent(event)
}

describe('useSettings — cross-tab sync', () => {
  beforeEach(() => {
    localStorage.clear()
    // Default matchMedia stub: report light system
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })) as unknown as typeof window.matchMedia
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('mirrors a theme write from another tab', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    const { result } = renderHook(() => useSettings())
    expect(result.current.appearance.theme).toBe('light')

    act(() => {
      fireStorageEvent(THEME_STORAGE_KEY, 'dark')
    })

    expect(result.current.appearance.theme).toBe('dark')
  })

  it('resets theme to default when another tab clears the key', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const { result } = renderHook(() => useSettings())
    expect(result.current.appearance.theme).toBe('dark')

    act(() => {
      fireStorageEvent(THEME_STORAGE_KEY, null)
    })

    // Default appearance theme is 'system'
    expect(result.current.appearance.theme).toBe('system')
  })

  it('ignores invalid theme values from other tabs', () => {
    const { result } = renderHook(() => useSettings())
    const initial = result.current.appearance.theme

    act(() => {
      fireStorageEvent(THEME_STORAGE_KEY, 'not-a-theme')
    })

    expect(result.current.appearance.theme).toBe(initial)
  })

  it('mirrors a reading-prefs write from another tab', () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.reading.defaultSort).toBe('newest')

    act(() => {
      fireStorageEvent(
        READING_STORAGE_KEY,
        JSON.stringify({ defaultSort: 'oldest', postsPerPage: 12, autoExpandComments: true })
      )
    })

    expect(result.current.reading.defaultSort).toBe('oldest')
    expect(result.current.reading.postsPerPage).toBe(12)
    expect(result.current.reading.autoExpandComments).toBe(true)
  })

  it('falls back to defaults on malformed reading payload', () => {
    const { result } = renderHook(() => useSettings())

    act(() => {
      fireStorageEvent(READING_STORAGE_KEY, '{not json')
    })

    expect(result.current.reading.defaultSort).toBe('newest')
  })

  it('resets reading to defaults when another tab clears the key', () => {
    localStorage.setItem(
      READING_STORAGE_KEY,
      JSON.stringify({ defaultSort: 'oldest', postsPerPage: 24, autoExpandComments: true })
    )
    const { result } = renderHook(() => useSettings())
    expect(result.current.reading.defaultSort).toBe('oldest')

    act(() => {
      fireStorageEvent(READING_STORAGE_KEY, null)
    })

    expect(result.current.reading.defaultSort).toBe('newest')
  })
})

describe('useSettings — system theme resolution', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('resolves to dark when the system reports dark', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })) as unknown as typeof window.matchMedia

    localStorage.setItem(THEME_STORAGE_KEY, 'system')
    const { result } = renderHook(() => useSettings())

    expect(result.current.resolvedTheme).toBe('dark')
  })
})
