import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { AppShell } from '../components/shell'
import { useAuth, useProfile } from '../hooks'

export function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, isLoading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading } = useProfile(user?.id)

  const navigationItems = [
    { label: 'Home',          href: '/kbw-notes/home',          isActive: false },
    { label: 'Submissions',   href: '/kbw-notes/submissions',   isActive: false },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: false },
    { label: 'Settings',      href: '/kbw-notes/settings',      isActive: false },
  ]

  const handleNavigate = (href: string) => navigate(href)
  const handleLogout = async () => { await signOut(); navigate('/') }
  const handleSignIn = () => navigate('/', { state: { from: location.pathname } })

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true, state: { from: location.pathname } })
    }
  }, [authLoading, user, navigate, location.pathname])

  if (!authLoading && !user) return null

  const isLoading = authLoading || profileLoading

  const displayName = profile?.display_name ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? 'User'
  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null
  const bio = profile?.bio ?? null
  const website = profile?.website ?? null
  const email = user?.email ?? ''
  const provider = user?.app_metadata?.provider ?? 'unknown'

  const userDisplay = user ? { name: displayName, email, avatarUrl } : undefined

  return (
    <AppShell
      navigationItems={navigationItems}
      user={userDisplay}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onSignIn={handleSignIn}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
        <header>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.08em',
              color: 'var(--color-accent)',
              fontWeight: 600,
              marginBottom: 'var(--space-2)',
            }}
          >
            Author
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'var(--text-h2)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            Your profile.
          </h1>
        </header>

        {isLoading ? (
          <div
            style={{
              padding: 'var(--space-9) 0',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-ink-soft)',
            }}
          >
            Loading…
          </div>
        ) : (
          <section
            style={{
              background: 'var(--color-paper-raised)',
              border: '1px solid var(--color-hair)',
              padding: 'var(--space-6)',
            }}
          >
            <div className="flex items-start" style={{ gap: 'var(--space-5)' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-hair)' }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'var(--color-accent-tint)',
                    color: 'var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 32,
                    fontWeight: 600,
                    border: '1px solid var(--color-hair)',
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'var(--text-section)',
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                    margin: 0,
                  }}
                >
                  {displayName}
                </h2>
                <p
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-mono-sm)',
                    color: 'var(--color-ink-muted)',
                    letterSpacing: '0.02em',
                    margin: 0,
                    marginTop: 4,
                  }}
                >
                  {email}
                </p>
                <p
                  className="font-mono uppercase"
                  style={{
                    fontSize: 'var(--text-mono-xs)',
                    letterSpacing: '0.04em',
                    color: 'var(--color-ink-soft)',
                    margin: 0,
                    marginTop: 4,
                  }}
                >
                  Signed in via {provider}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/kbw-notes/profile/setup', { state: { from: '/kbw-notes/profile' } })}
                className="font-mono uppercase"
                style={{
                  fontSize: 'var(--text-mono-sm)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  background: 'transparent',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-ink)',
                  borderRadius: 2,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  transition: 'background-color 100ms ease, color 100ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-ink)'
                  e.currentTarget.style.color = 'var(--color-paper)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-ink)'
                }}
              >
                Edit profile
              </button>
            </div>

            {bio && (
              <div style={{ borderTop: '1px solid var(--color-hair)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)' }}>
                <div
                  className="font-mono uppercase"
                  style={{ fontSize: 'var(--text-mono-xs)', letterSpacing: '0.08em', color: 'var(--color-ink-soft)', marginBottom: 'var(--space-2)' }}
                >
                  Bio
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-ui-base)', color: 'var(--color-ink)', margin: 0, lineHeight: 1.55 }}>
                  {bio}
                </p>
              </div>
            )}

            {website && /^https?:\/\//i.test(website) && (
              <div style={{ borderTop: '1px solid var(--color-hair)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)' }}>
                <div
                  className="font-mono uppercase"
                  style={{ fontSize: 'var(--text-mono-xs)', letterSpacing: '0.08em', color: 'var(--color-ink-soft)', marginBottom: 'var(--space-2)' }}
                >
                  Website
                </div>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                  style={{
                    gap: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-mono-sm)',
                    color: 'var(--color-accent)',
                    textDecoration: 'underline',
                    textDecorationThickness: 1,
                    textUnderlineOffset: 3,
                  }}
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                  {website}
                </a>
              </div>
            )}

            {!bio && !website && (
              <div style={{ borderTop: '1px solid var(--color-hair)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'italic',
                    fontSize: 'var(--text-ui-sm)',
                    color: 'var(--color-ink-muted)',
                    margin: 0,
                  }}
                >
                  No bio or website yet. Click "Edit profile" to add details.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  )
}
