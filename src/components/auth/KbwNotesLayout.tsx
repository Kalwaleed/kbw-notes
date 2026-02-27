import { Outlet } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

export function KbwNotesLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  )
}
