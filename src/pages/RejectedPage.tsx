import { Link } from 'react-router-dom'

export function RejectedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.15) 0%, #020617 70%)' }}
    >
      {/* Pulsing overlay */}
      <div className="absolute inset-0 pointer-events-none animate-[rejected-alarm_2s_ease-in-out_infinite]" />

      {/* REJECTED text */}
      <h1
        className="relative text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter select-none animate-[rejected-slam_0.8s_cubic-bezier(0.22,1,0.36,1)_forwards]"
        style={{
          fontFamily: 'var(--font-heading)',
          background: `linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600), var(--color-primary-300))`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 40px rgba(139, 92, 246, 0.5))',
        }}
      >
        REJECTED!
      </h1>

      {/* Subtitle */}
      <p className="mt-8 text-slate-400 text-lg text-center max-w-md animate-[fadeIn_1s_ease-in_0.8s_both]">
        You are not on the invite list.
      </p>

      {/* Back link */}
      <Link
        to="/"
        className="mt-8 text-sm text-violet-400 hover:text-violet-300 transition-colors animate-[fadeIn_1s_ease-in_1.2s_both]"
      >
        Go back
      </Link>
    </div>
  )
}
