import { createBrowserRouter } from 'react-router-dom'
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/post/:id',
    element: <PostPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/profile/setup',
    element: <ProfileSetupPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/submissions',
    element: <SubmissionsPage />,
  },
  {
    path: '/submissions/new',
    element: <NewSubmissionPage />,
  },
  {
    path: '/submissions/:id',
    element: <SubmissionDetailPage />,
  },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
])
