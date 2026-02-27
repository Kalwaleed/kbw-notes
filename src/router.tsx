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
import { KbwNotesLayout } from './components/auth'

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
        path: '/kbw-notes',
        element: <KbwNotesLayout />,
        children: [
          { path: 'home', element: <HomePage /> },
          { path: 'post/:id', element: <PostPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/setup', element: <ProfileSetupPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'submissions', element: <SubmissionsPage /> },
          { path: 'submissions/new', element: <NewSubmissionPage /> },
          { path: 'submissions/:id', element: <SubmissionDetailPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },
      // Catch-all 404 route
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
