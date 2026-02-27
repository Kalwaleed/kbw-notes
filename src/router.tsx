import { createBrowserRouter, Outlet } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { PostPage } from './pages/PostPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProfileSetupPage } from './pages/ProfileSetupPage'
import { SettingsPage } from './pages/SettingsPage'
import { SubmissionsPage } from './pages/SubmissionsPage'
import { NewSubmissionPage } from './pages/NewSubmissionPage'
import { SubmissionDetailPage } from './pages/SubmissionDetailPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RouterErrorPage } from './pages/RouterErrorPage'
import { ProtectedRoute } from './components/auth'

export const router = createBrowserRouter([
  {
    // Root layout — errorElement here covers ALL child routes
    errorElement: <RouterErrorPage />,
    element: <Outlet />,
    children: [
      // Login page at root
      {
        path: '/',
        element: <LoginPage />,
      },
      // Authenticated app under /kbw-notes
      {
        path: '/kbw-notes/home',
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kbw-notes/post/:id',
        element: (
          <ProtectedRoute>
            <PostPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kbw-notes/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kbw-notes/profile/setup',
        element: (
          <ProtectedRoute>
            <ProfileSetupPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kbw-notes/settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kbw-notes/submissions',
        element: (
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kbw-notes/submissions/new',
        element: (
          <ProtectedRoute>
            <NewSubmissionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kbw-notes/submissions/:id',
        element: (
          <ProtectedRoute>
            <SubmissionDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/kbw-notes/notifications',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      // Catch-all 404 route
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
