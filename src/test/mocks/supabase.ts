import { vi } from 'vitest'

/**
 * Creates a deeply mocked Supabase client for testing.
 * Chainable query builder methods return `this`, terminal methods resolve `{ data, error }`.
 */
export function createMockSupabase() {
  const queryBuilder: Record<string, ReturnType<typeof vi.fn>> = {}

  // Terminal methods resolve { data, error }
  const terminalResult = { data: null, error: null }

  // Build chainable query builder — each method returns the builder itself
  const chainMethods = ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'order', 'limit', 'range', 'in', 'is', 'match', 'filter', 'maybeSingle']
  const terminalMethods = ['single']

  const builder = {} as Record<string, ReturnType<typeof vi.fn>>

  for (const method of chainMethods) {
    builder[method] = vi.fn().mockReturnThis()
  }

  for (const method of terminalMethods) {
    builder[method] = vi.fn().mockResolvedValue(terminalResult)
  }

  // Make chainable methods also resolve as promises (for await on the chain)
  const thenFn = vi.fn((resolve) => resolve(terminalResult))
  for (const method of chainMethods) {
    const original = builder[method]
    builder[method] = vi.fn((...args: unknown[]) => {
      original(...args)
      return new Proxy(builder, {
        get(target, prop) {
          if (prop === 'then') return thenFn
          return target[prop as string]
        },
      })
    })
  }

  queryBuilder.from = vi.fn(() => builder)

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: {
        subscription: { unsubscribe: vi.fn() },
      },
    }),
  }

  const mockFunctions = {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  const mockStorage = {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test/image.png' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.png' } }),
      remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  }

  return {
    auth: mockAuth,
    from: queryBuilder.from,
    functions: mockFunctions,
    storage: mockStorage,
    _builder: builder,
    _terminalResult: terminalResult,
  }
}

export type MockSupabase = ReturnType<typeof createMockSupabase>
