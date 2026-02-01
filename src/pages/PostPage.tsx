import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth, useComments } from '../hooks'
import { BlogPostView } from '../components/blog-post'
import { fetchBlogPost } from '../lib/queries/blog'

interface PostData {
  id: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  tags: string[]
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

export function PostPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: postId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [post, setPost] = useState<PostData | null>(null)
  const [postLoading, setPostLoading] = useState(true)
  const [postError, setPostError] = useState<string | null>(null)

  // Fetch the post data
  useEffect(() => {
    if (!postId) return

    setPostLoading(true)
    setPostError(null)

    fetchBlogPost(postId)
      .then((data) => {
        if (data) {
          setPost(data)
        } else {
          setPostError('Post not found')
        }
      })
      .catch((err) => {
        setPostError(err.message)
      })
      .finally(() => {
        setPostLoading(false)
      })
  }, [postId])

  // Use real comments from Supabase with AI moderation
  // Anonymous users can now comment without authentication
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

  // Share handlers
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
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // Silently fail - clipboard may not be available
    }
  }

  // Comment handlers - now connected to Supabase
  const handleAddComment = async (content: string) => {
    await addComment(content)
  }

  const handleReply = async (commentId: string, content: string) => {
    await addReply(commentId, content)
  }

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId)
  }

  const handleReact = async (commentId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/', { state: { from: location.pathname } })
      return
    }
    try {
      await likeComment(commentId)
    } catch (err) {
      console.error('Failed to like comment:', err)
      alert(err instanceof Error ? err.message : 'Failed to like comment')
    }
  }

  const handleReport = (_commentId: string) => {
    // TODO: Implement reports table
  }

  const handleLoadMore = async () => {
    // TODO: Implement pagination if needed
  }

  const handleLoginClick = () => {
    navigate('/', { state: { from: location.pathname } })
  }

  // Loading state
  if (postLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading post...</div>
      </div>
    )
  }

  // Error state
  if (postError || !post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {postError ?? 'Post not found'}
          </h1>
          <button
            onClick={() => navigate('/kbw-notes/home')}
            className="text-violet-600 dark:text-violet-400 hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Transform post data to match BlogPostView props
  const blogPostData = {
    id: post.id,
    headline: post.title,
    subheader: post.excerpt,
    body: post.content,
    author: {
      id: post.author.id,
      name: post.author.name,
      avatar: post.author.avatarUrl ?? '',
    },
    publishedAt: post.publishedAt,
    readingTime: Math.ceil(post.content.length / 1000),
    tags: post.tags,
  }

  return (
    <BlogPostView
      blogPost={blogPostData}
      comments={comments}
      isAuthenticated={true}
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
  )
}
