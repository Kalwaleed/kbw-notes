import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { ErrorPage } from './NotFoundPage'

export function RouterErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()
  const is404 = isRouteErrorResponse(error) && error.status === 404
  return (
    <ErrorPage
      variant={is404 ? '404' : 'error'}
      onHome={() => navigate('/kbw-notes/home')}
      onBack={() => navigate(-1)}
    />
  )
}
