import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './router'

vi.mock('./pages/HomePage', () => ({
  HomePage: () => <div data-testid="home-page">Home</div>,
}))

vi.mock('./pages/PostPage', () => ({
  PostPage: () => <div data-testid="post-page">Post</div>,
}))

vi.mock('./pages/SettingsPage', () => ({
  SettingsPage: () => <div data-testid="settings-page">Settings</div>,
}))

vi.mock('./pages/RejectedPage', () => ({
  RejectedPage: () => <div data-testid="rejected-page">Rejected</div>,
}))

vi.mock('./pages/NotFoundPage', () => ({
  NotFoundPage: () => <h1>404 Not Found</h1>,
}))

vi.mock('./pages/RouterErrorPage', () => ({
  RouterErrorPage: () => <div>Route error</div>,
}))

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

describe('public reader routes', () => {
  it('redirects / to /kbw-notes/home', async () => {
    const router = renderAt('/')

    await screen.findByTestId('home-page')
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/kbw-notes/home')
    })
  })

  it('renders the anonymous reader home route directly', async () => {
    const router = renderAt('/kbw-notes/home')

    await screen.findByTestId('home-page')
    expect(router.state.location.pathname).toBe('/kbw-notes/home')
  })

  it('renders public post routes directly', async () => {
    const router = renderAt('/kbw-notes/post/post-1')

    await screen.findByTestId('post-page')
    expect(router.state.location.pathname).toBe('/kbw-notes/post/post-1')
  })

  it.each([
    '/kbw-notes/profile',
    '/kbw-notes/profile/setup',
    '/kbw-notes/submissions',
    '/kbw-notes/submissions/new',
    '/kbw-notes/notifications',
  ])('does not expose %s', async (path) => {
    const router = renderAt(path)

    await screen.findByRole('heading', { name: /404 not found/i })
    expect(router.state.location.pathname).toBe(path)
  })
})
