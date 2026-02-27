import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1
          className="text-6xl font-bold text-slate-900 dark:text-white mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          404
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/kbw-notes/home')}
            className="px-6 py-3 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
