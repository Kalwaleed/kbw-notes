import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Globe } from 'lucide-react'
import { useAuth, useProfile, useSettings } from '../hooks'

function ProfileSetupForm({
  initialDisplayName,
  initialBio,
  initialWebsite,
  avatarUrl,
  profile,
  updateProfile,
  createProfile,
}: {
  initialDisplayName: string
  initialBio: string
  initialWebsite: string
  avatarUrl: string | null
  profile: ReturnType<typeof useProfile>['profile']
  updateProfile: ReturnType<typeof useProfile>['updateProfile']
  createProfile: ReturnType<typeof useProfile>['createProfile']
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { resolvedTheme, toggleTheme } = useSettings()

  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [bio, setBio] = useState(initialBio)
  const [website, setWebsite] = useState(initialWebsite)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isIntentionalEdit = location.state?.from === '/kbw-notes/profile' || document.referrer.includes('/kbw-notes/profile')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters')
      return
    }

    setIsSubmitting(true)

    const trimmedWebsite = website.trim()
    if (trimmedWebsite && !/^https?:\/\//i.test(trimmedWebsite)) {
      setError('Website must start with http:// or https://')
      setIsSubmitting(false)
      return
    }

    const profileData = {
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      website: trimmedWebsite || null,
      avatar_url: avatarUrl,
    }

    const result = profile
      ? await updateProfile(profileData)
      : await createProfile(profileData)

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      const redirectTo = location.state?.from === '/kbw-notes/profile' ? '/kbw-notes/profile' : '/kbw-notes/home'
      navigate(redirectTo)
    }
  }

  const bioMaxLength = 280
  const isFormValid = displayName.trim().length >= 2

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-paper)',
        color: 'var(--color-ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-7) var(--space-5)',
        position: 'relative',
      }}
    >
      <div className="paper-grain" aria-hidden="true" />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 2 }}>
        <header style={{ marginBottom: 'var(--space-7)' }}>
          <div
            className="font-mono uppercase"
            style={{ fontSize: 'var(--text-mono-xs)', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600, marginBottom: 'var(--space-2)' }}
          >
            ── kbw Notes
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
            {isIntentionalEdit ? 'Edit your profile.' : 'Complete your profile.'}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-base)',
              color: 'var(--color-ink-muted)',
              margin: 0,
              marginTop: 'var(--space-2)',
            }}
          >
            {isIntentionalEdit ? 'Update what other readers see.' : 'Tell us a bit about yourself.'}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--color-paper-raised)',
            border: '1px solid var(--color-hair)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-hair)' }}
              />
            ) : (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: 'var(--color-accent-tint)',
                  color: 'var(--color-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 36,
                  fontWeight: 600,
                  border: '1px solid var(--color-hair)',
                }}
              >
                {displayName.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>

          <FieldLabel htmlFor="displayName">Display name</FieldLabel>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we call you?"
            required
            minLength={2}
          />

          <div>
            <FieldLabel htmlFor="bio">Bio</FieldLabel>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, bioMaxLength))}
              placeholder="A line or two."
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-paper)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-hair)',
                borderRadius: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-ui-base)',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <div
              className="font-mono"
              style={{ fontSize: 'var(--text-mono-xs)', textAlign: 'right', color: 'var(--color-ink-soft)', marginTop: 4, letterSpacing: '0.02em' }}
            >
              {bio.length} / {bioMaxLength}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <div style={{ position: 'relative' }}>
              <Globe
                size={16}
                strokeWidth={1.5}
                style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: 'var(--color-ink-soft)' }}
                aria-hidden="true"
              />
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-hair)',
                  borderRadius: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-mono-base)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-rose-tint)',
                borderLeft: '2px solid var(--color-rose)',
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic',
                fontSize: 'var(--text-ui-sm)',
                color: 'var(--color-rose)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="font-mono uppercase"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 'var(--text-mono-sm)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              background: 'var(--color-ink)',
              color: 'var(--color-paper)',
              border: 'none',
              borderRadius: 2,
              cursor: !isFormValid || isSubmitting ? 'not-allowed' : 'pointer',
              opacity: !isFormValid || isSubmitting ? 0.4 : 1,
              transition: 'background-color 100ms ease',
            }}
            onMouseEnter={(e) => {
              if (!isFormValid || isSubmitting) return
              e.currentTarget.style.background = 'var(--color-accent)'
            }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-ink)' }}
          >
            {isSubmitting ? 'Saving…' : isIntentionalEdit ? 'Save changes' : 'Complete setup'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-5)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={toggleTheme}
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.04em',
              color: 'var(--color-ink-soft)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} mode
          </button>
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono uppercase"
      style={{
        display: 'block',
        fontSize: 'var(--text-mono-xs)',
        letterSpacing: '0.08em',
        color: 'var(--color-ink-soft)',
        fontWeight: 600,
        marginBottom: 'var(--space-2)',
      }}
    >
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      {...props}
      style={{
        width: '100%',
        padding: '10px 16px',
        background: 'var(--color-paper)',
        color: 'var(--color-ink)',
        border: '1px solid var(--color-hair)',
        borderRadius: 0,
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-ui-base)',
        outline: 'none',
        ...props.style,
      }}
    />
  )
}

export function ProfileSetupPage() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading, updateProfile, createProfile } = useProfile(user?.id)

  const avatarUrl = user?.user_metadata?.avatar_url || null

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { state: { from: '/kbw-notes/profile/setup' } })
    }
  }, [authLoading, user, navigate])

  const isLoading = authLoading || profileLoading

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-paper)',
          color: 'var(--color-ink-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-mono-sm)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Loading…
      </div>
    )
  }

  const initialDisplayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const initialBio = profile?.bio || ''
  const initialWebsite = profile?.website || ''

  return (
    <ProfileSetupForm
      key={profile?.id || user?.id || 'new'}
      initialDisplayName={initialDisplayName}
      initialBio={initialBio}
      initialWebsite={initialWebsite}
      avatarUrl={avatarUrl}
      profile={profile}
      updateProfile={updateProfile}
      createProfile={createProfile}
    />
  )
}
