import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router-dom'
import { RouterErrorPage } from './pages/RouterErrorPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { GateGuard } from './components/GateGuard'
import { RoleGuard } from './components/RoleGuard'

// Pages load through route-level `lazy` so each becomes its own chunk and the
// entry bundle stays small. The error page and GateGuard stay eager: they must
// render even when a lazy chunk fails to load.
export const routes: RouteObject[] = [
  {
    // Root layout: errorElement here covers all child routes.
    errorElement: <RouterErrorPage />,
    element: <Outlet />,
    // Rendered while a lazy route chunk loads on first paint; an empty
    // fragment keeps the paper background with no flash (and silences the
    // HydrateFallback warning — react-router treats null as "not provided").
    hydrateFallbackElement: <></>,
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
      // Staff self-report surface: real-auth RoleGuard, deliberately OUTSIDE
      // the soft localStorage GateGuard (a Supabase session is the stronger
      // gate; staff shouldn't need the public site password to file reports).
      {
        path: '/kbw-notes/report',
        element: <RoleGuard><Outlet /></RoleGuard>,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/SelfReportPage')).SelfReportPage,
            }),
          },
        ],
      },
      {
        path: '/kbw-notes/report/review',
        element: <RoleGuard requireReviewer><Outlet /></RoleGuard>,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/ReviewerPage')).ReviewerPage,
            }),
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
