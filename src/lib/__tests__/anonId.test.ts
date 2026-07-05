import { describe, it, expect, beforeEach, vi } from 'vitest'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

describe('getAnonId', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  it('mints a UUID and persists it to localStorage', async () => {
    const { getAnonId } = await import('../anonId')
    const id = getAnonId()
    expect(id).toMatch(UUID_RE)
    expect(localStorage.getItem('kbw-anon-id')).toBe(id)
  })

  it('returns the same id across calls', async () => {
    const { getAnonId } = await import('../anonId')
    expect(getAnonId()).toBe(getAnonId())
  })

  it('reuses a valid stored id', async () => {
    const stored = '123e4567-e89b-42d3-a456-426614174000'
    localStorage.setItem('kbw-anon-id', stored)
    const { getAnonId } = await import('../anonId')
    expect(getAnonId()).toBe(stored)
  })

  it('replaces a corrupted stored value instead of trusting it', async () => {
    localStorage.setItem('kbw-anon-id', '<script>not-a-uuid</script>')
    const { getAnonId } = await import('../anonId')
    const id = getAnonId()
    expect(id).toMatch(UUID_RE)
    expect(localStorage.getItem('kbw-anon-id')).toBe(id)
  })

  it('still returns a stable id when localStorage throws', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    try {
      const { getAnonId } = await import('../anonId')
      const first = getAnonId()
      expect(first).toMatch(UUID_RE)
      expect(getAnonId()).toBe(first)
    } finally {
      getItem.mockRestore()
      setItem.mockRestore()
    }
  })
})
