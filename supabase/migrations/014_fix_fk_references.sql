-- ============================================================================
-- Fix FK References and Trigger search_path
-- 1. Fix post_likes FK: blog_posts -> submissions
-- 2. Fix post_bookmarks FK: blog_posts -> submissions
-- 3. Re-add comments FK (dropped in migration 004)
-- 4. Fix prevent_moderation_status_change trigger search_path
-- ============================================================================

-- ============================================================================
-- Fix 1: post_likes FK -> submissions
-- ============================================================================

ALTER TABLE public.post_likes
  DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;

ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES public.submissions(id) ON DELETE CASCADE;

-- ============================================================================
-- Fix 2: post_bookmarks FK -> submissions
-- ============================================================================

ALTER TABLE public.post_bookmarks
  DROP CONSTRAINT IF EXISTS post_bookmarks_post_id_fkey;

ALTER TABLE public.post_bookmarks
  ADD CONSTRAINT post_bookmarks_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES public.submissions(id) ON DELETE CASCADE;

-- ============================================================================
-- Fix 3: Re-add comments FK -> submissions (dropped in migration 004)
-- ============================================================================

ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_post_id_fkey;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES public.submissions(id) ON DELETE CASCADE;

-- ============================================================================
-- Fix 4: Recreate prevent_moderation_status_change with SET search_path = ''
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_moderation_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.is_moderated IS DISTINCT FROM NEW.is_moderated THEN
    RAISE EXCEPTION 'Cannot modify moderation status';
  END IF;
  RETURN NEW;
END;
$$;
