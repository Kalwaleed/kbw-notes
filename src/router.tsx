import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router-dom'
import { RouterErrorPage } from './pages/RouterErrorPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { GateGuard } from './components/GateGuard'

// Pages load through route-level `lazy` so each becomes its own chunk and the
// entry bundle stays small. The error page and GateGuard stay eager: they must
// render even when a lazy chunk fails to load.
export const routes: RouteObject[] = [
  {
    // Root layout: errorElement here covers all child routes.
    errorElement: <RouterErrorPage />,
    element: <Outlet />,
    children: [
      {
        path: '/kbw-notes',
        element: <GateGuard><Outlet /></GateGuard>,
        children: [
          { index: true, element: <Navigate to="home" replace /> },
          {
            path: 'home',
            lazy: async () => ({ Component: (await import('./pages/HomePage')).HomePage }),
          },
          {
            path: 'post/:id',
            lazy: async () => ({ Component: (await import('./pages/PostPage')).PostPage }),
          },
          {
            path: 'submissions',
            lazy: async () => ({
              Component: (await import('./pages/SubmissionsPage')).SubmissionsPage,
            }),
          },
          {
            path: 'settings',
            lazy: async () => ({ Component: (await import('./pages/SettingsPage')).SettingsPage }),
          },
        ],
      },
      // Eager: RouterErrorPage imports NotFoundPage statically, so lazy-loading
      // it here would not create a separate chunk anyway.
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
