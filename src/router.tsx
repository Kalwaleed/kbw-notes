import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { PostPage } from './pages/PostPage'
import { SettingsPage } from './pages/SettingsPage'
import { SubmissionsPage } from './pages/SubmissionsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RejectedPage } from './pages/RejectedPage'
import { RouterErrorPage } from './pages/RouterErrorPage'

export const routes: RouteObject[] = [
  {
    // Root layout: errorElement here covers all child routes.
    errorElement: <RouterErrorPage />,
    element: <Outlet />,
    children: [
      {
        path: '/',
        element: <Navigate to="/kbw-notes/home" replace />,
      },
      {
        path: '/rejected',
        element: <RejectedPage />,
      },
      {
        path: '/kbw-notes',
        element: <Outlet />,
        children: [
          { index: true, element: <Navigate to="home" replace /> },
          { path: 'home', element: <HomePage /> },
          { path: 'post/:id', element: <PostPage /> },
          { path: 'submissions', element: <SubmissionsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
