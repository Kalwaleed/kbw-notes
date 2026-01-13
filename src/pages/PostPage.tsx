import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth, useComments } from '../hooks'
import { BlogPostView } from '../components/blog-post'
import { sampleBlogPost } from '../components/blog-post/sample-data'

export function PostPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: postId } = useParams<{ id: string }>()
  const { user } = useAuth()

  // Use real comments from Supabase with AI moderation
  // Anonymous users can now comment without authentication
  const {
    comments,
    isLoading,
    moderationError,
    clearModerationError,
    addComment,
    addReply,
    deleteComment,
  } = useComments(postId ?? '')

  // Share handlers
  const handleShareTwitter = () => {
    const url = window.location.href
    const text = encodeURIComponent(sampleBlogPost.headline)
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
      console.log('Could not copy link')
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

  const handleReact = (commentId: string) => {
    console.log('React to comment:', commentId)
    // TODO: Implement reactions table
  }

  const handleReport = (commentId: string) => {
    console.log('Report comment:', commentId)
    // TODO: Implement reports table
  }

  const handleLoadMore = async () => {
    // TODO: Implement pagination if needed
  }

  const handleLoginClick = () => {
    navigate('/login', { state: { from: location.pathname } })
  }

  return (
    <BlogPostView
      blogPost={sampleBlogPost}
      comments={comments}
      isAuthenticated={true}
      currentUserId={user?.id}
      userReactions={new Set()}
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
