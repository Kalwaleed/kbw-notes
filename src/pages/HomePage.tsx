import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { AppShell } from '../components/shell'
import { BlogFeed } from '../components/blog-feed'
import { useTheme, useAuth, useProfile, useBlogPosts, usePostEngagement } from '../hooks'

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user, signOut, isLoading: authLoading } = useAuth()
  const { profileComplete, isLoading: profileLoading } = useProfile(user?.id)
  const { posts, isLoading, hasMore, loadMore, updatePost } = useBlogPosts({ limit: 6 })

  // Redirect to profile setup if user is logged in but profile is incomplete
  useEffect(() => {
    if (!authLoading && !profileLoading && user && !profileComplete) {
      navigate('/profile/setup')
    }
  }, [authLoading, profileLoading, user, profileComplete, navigate])
  const { toggleLike, toggleBookmark } = usePostEngagement()

  const navigationItems = [
    { label: 'Submissions', href: '/submissions', isActive: location.pathname === '/submissions' },
    { label: 'Notifications', href: '/notifications', isActive: location.pathname === '/notifications' },
    { label: 'Settings', href: '/settings', isActive: location.pathname === '/settings' },
  ]

  const handleNavigate = (href: string) => {
    navigate(href)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const handleSignIn = () => {
    navigate('/login', { state: { from: location.pathname } })
  }

  const handleViewPost = (id: string) => {
    navigate(`/post/${id}`)
  }

  const handleLike = (id: string) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    // Optimistic update
    const post = posts.find((p) => p.id === id)
    if (post) {
      updatePost(id, {
        isLiked: !post.isLiked,
        likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
      })
    }

    toggleLike(id, (isLiked) => {
      // Sync with server response (in case of mismatch)
      const currentPost = posts.find((p) => p.id === id)
      if (currentPost && currentPost.isLiked !== isLiked) {
        updatePost(id, { isLiked })
      }
    })
  }

  const handleBookmark = (id: string) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    // Optimistic update
    const post = posts.find((p) => p.id === id)
    if (post) {
      updatePost(id, { isBookmarked: !post.isBookmarked })
    }

    toggleBookmark(id, (isBookmarked) => {
      // Sync with server response
      const currentPost = posts.find((p) => p.id === id)
      if (currentPost && currentPost.isBookmarked !== isBookmarked) {
        updatePost(id, { isBookmarked })
      }
    })
  }

  const handleShare = async (id: string) => {
    const post = posts.find((p) => p.id === id)
    const url = `${window.location.origin}/post/${id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title ?? 'Check out this post',
          text: post?.excerpt,
          url,
        })
      } catch {
        // User cancelled or share failed - copy to clipboard as fallback
        await navigator.clipboard.writeText(url)
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(url)
      // Could add a toast notification here
    }
  }

  // User display info
  const userDisplay = user
    ? {
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'User',
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-slate-900 dark:text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              kbw Notes
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Tech discoveries, projects, and insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Blog Feed */}
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
