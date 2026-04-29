import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth, useComments } from '../hooks'
import { AppShell } from '../components/shell'
import { BlogPostView } from '../components/blog-post'
import { fetchBlogPost, getPostLikeCount } from '../lib/queries/blog'

type PostData = NonNullable<Awaited<ReturnType<typeof fetchBlogPost>>>

/** Strip HTML tags, count words, divide by 200 (avg adult reading speed). */
function computeReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function PostPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: postId } = useParams<{ id: string }>()
  const { user, signOut } = useAuth()
  const [post, setPost] = useState<PostData | null>(null)
  const [postLoading, setPostLoading] = useState(true)
  const [postError, setPostError] = useState<string | null>(null)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    if (!postId) return

    let cancelled = false
    const id = postId

    async function loadPost() {
      try {
        const [data, likes] = await Promise.all([
          fetchBlogPost(id),
          getPostLikeCount(id),
        ])
        if (cancelled) return
        if (data) {
          setPost(data)
          setLikeCount(likes)
        } else {
          setPostError('Post not found')
        }
      } catch (err) {
        if (cancelled) return
        setPostError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        if (!cancelled) setPostLoading(false)
      }
    }

    loadPost()
    return () => { cancelled = true }
  }, [postId])

  const {
    comments,
    isLoading,
    moderationError,
    clearModerationError,
    userLikedComments,
    addComment,
    addReply,
    deleteComment,
    likeComment,
  } = useComments(postId ?? '')

  const navigationItems = [
    { label: 'Home',          href: '/kbw-notes/home',          isActive: false },
    { label: 'Submissions',   href: '/kbw-notes/submissions',   isActive: false },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: false },
    { label: 'Settings',      href: '/kbw-notes/settings',      isActive: false },
  ]

  const userDisplay = user
    ? {
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'User',
        email: user.email ?? undefined,
        avatarUrl: user.user_metadata?.avatar_url,
      }
    : undefined

  const handleNavigate = (href: string) => navigate(href)
  const handleLogout = async () => { await signOut(); navigate('/') }
  const handleSignIn = () => navigate('/', { state: { from: location.pathname } })

  const handleShareTwitter = () => {
    const url = window.location.href
    const text = encodeURIComponent(post?.title ?? '')
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, '_blank')
  }

  const handleShareLinkedIn = () => {
    const url = window.location.href
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href) } catch { /* ignore */ }
  }

  const handleAddComment = async (content: string) => { await addComment(content) }
  const handleReply = async (commentId: string, content: string) => { await addReply(commentId, content) }
  const handleDelete = async (commentId: string) => { await deleteComment(commentId) }

  const handleReact = async (commentId: string) => {
    if (!user) {
      navigate('/', { state: { from: location.pathname } })
      return
    }
    try { await likeComment(commentId) } catch (err) {
      console.error('Failed to like comment:', err)
      alert(err instanceof Error ? err.message : 'Failed to like comment')
    }
  }

  const handleReport = () => { /* TODO: reports table */ }
  const handleLoadMore = async () => { /* TODO: pagination */ }
  const handleLoginClick = () => navigate('/', { state: { from: location.pathname } })

  if (postLoading) {
    return (
      <AppShell
        navigationItems={navigationItems}
        user={userDisplay}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSignIn={handleSignIn}
        containerWidth="wide"
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-mono-sm)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-soft)',
            padding: 'var(--space-9) 0',
            textAlign: 'center',
          }}
        >
          Loading post…
        </div>
      </AppShell>
    )
  }

  if (postError || !post) {
    return (
      <AppShell
        navigationItems={navigationItems}
        user={userDisplay}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSignIn={handleSignIn}
        containerWidth="wide"
      >
        <div style={{ padding: 'var(--space-9) 0', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'var(--text-h2)',
              color: 'var(--color-ink)',
              margin: 0,
              marginBottom: 'var(--space-4)',
            }}
          >
            {postError ?? 'Post not found'}
          </h1>
          <button
            type="button"
            onClick={() => navigate('/kbw-notes/home')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-mono-sm)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}
          >
            ← Back to home
          </button>
        </div>
      </AppShell>
    )
  }

  const blogPostData = {
    ...post,
    readingTime: computeReadingTime(post.content),
    likeCount,
    commentCount: comments.length,
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      user={userDisplay}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onSignIn={handleSignIn}
      containerWidth="wide"
    >
      <BlogPostView
        blogPost={blogPostData}
        comments={comments}
        isAuthenticated={!!user}
        currentUserId={user?.id}
        userReactions={userLikedComments}
        isLoading={isLoading}
        hasMoreComments={false}
        moderationError={moderationError}
        onClearModerationError={clearModerationError}
        onShareTwitter={handleShareTwitter}
        onShareLinkedIn={handleShareLinkedIn}
        onCopyLink={handleCopyLink}
        onAddComment={handleAddComment}
        onReply={handleReply}
        onDelete={handleDelete}
        onReact={handleReact}
        onReport={handleReport}
        onLoadMore={handleLoadMore}
        onLoginClick={handleLoginClick}
      />
    </AppShell>
  )
}
