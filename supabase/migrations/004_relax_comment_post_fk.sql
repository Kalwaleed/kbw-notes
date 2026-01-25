-- ============================================================================
-- Relax Comments Post Foreign Key
-- ============================================================================
-- This migration removes the foreign key constraint on comments.post_id
-- to allow comments on posts that may not exist in the database yet.
-- This is useful during development when using sample/mock data.

-- Drop the foreign key constraint
ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_post_id_fkey;

-- Add a comment explaining the change
COMMENT ON COLUMN public.comments.post_id IS 'Post ID - no longer requires FK to blog_posts for flexibility with sample data';
