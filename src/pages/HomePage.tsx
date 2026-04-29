import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from '../components/shell'
import { BlogFeed } from '../components/blog-feed'
import { useAuth, useProfile, useBlogPosts, usePostEngagement } from '../hooks'

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, isLoading: authLoading } = useAuth()
  const { profileComplete, isLoading: profileLoading } = useProfile(user?.id)
  const { posts, isLoading, hasMore, loadMore, updatePost } = useBlogPosts({ limit: 6 })

  useEffect(() => {
    if (!authLoading && !profileLoading && user && !profileComplete) {
      navigate('/kbw-notes/profile/setup')
    }
  }, [authLoading, profileLoading, user, profileComplete, navigate])

  const { toggleLike, toggleBookmark } = usePostEngagement()

  const navigationItems = [
    { label: 'Home',          href: '/kbw-notes/home',          isActive: location.pathname === '/kbw-notes/home' },
    { label: 'Submissions',   href: '/kbw-notes/submissions',   isActive: location.pathname === '/kbw-notes/submissions' },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: location.pathname === '/kbw-notes/notifications' },
    { label: 'Settings',      href: '/kbw-notes/settings',      isActive: location.pathname === '/kbw-notes/settings' },
  ]

  const handleNavigate = (href: string) => navigate(href)
  const handleLogout = async () => { await signOut(); navigate('/') }
  const handleSignIn = () => navigate('/', { state: { from: location.pathname } })

  const handleViewPost = (id: string) => navigate(`/kbw-notes/post/${id}`)

  const handleLike = (id: string) => {
    if (!user) {
      navigate('/', { state: { from: location.pathname } })
      return
    }
    const post = posts.find((p) => p.id === id)
    if (post) {
      updatePost(id, {
        isLiked: !post.isLiked,
        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
      })
    }
    toggleLike(id, (isLiked) => {
      const currentPost = posts.find((p) => p.id === id)
      if (currentPost && currentPost.isLiked !== isLiked) updatePost(id, { isLiked })
    })
  }

  const handleBookmark = (id: string) => {
    if (!user) {
      navigate('/', { state: { from: location.pathname } })
      return
    }
    const post = posts.find((p) => p.id === id)
    if (post) updatePost(id, { isBookmarked: !post.isBookmarked })
    toggleBookmark(id, (isBookmarked) => {
      const currentPost = posts.find((p) => p.id === id)
      if (currentPost && currentPost.isBookmarked !== isBookmarked) updatePost(id, { isBookmarked })
    })
  }

  const handleShare = async (id: string) => {
    const post = posts.find((p) => p.id === id)
    const url = `${window.location.origin}/kbw-notes/post/${id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title ?? 'kbw Notes',
          text: post?.excerpt,
          url,
        })
      } catch {
        await navigator.clipboard.writeText(url)
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const userDisplay = user
    ? {
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'User',
        email: user.email ?? undefined,
        avatarUrl: user.user_metadata?.avatar_url,
      }
    : undefined

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
            Edition feed
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
            Notes from the desk.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-base)',
              fontStyle: 'italic',
              color: 'var(--color-ink-muted)',
              margin: 0,
              marginTop: 'var(--space-2)',
              maxWidth: '52ch',
            }}
          >
            Essays, technical write-ups, and operating notes. Lead piece sets the run.
          </p>
        </header>

        <BlogFeed
          blogPosts={posts}
          onViewPost={handleViewPost}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onLoadMore={loadMore}
          isLoading={isLoading}
          hasMore={hasMore}
        />
      </div>
    </AppShell>
  )
}
