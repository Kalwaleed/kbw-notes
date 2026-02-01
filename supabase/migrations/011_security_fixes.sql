-- ============================================================================
-- Security Fixes Migration
-- Addresses Supabase Security Advisor findings:
-- 1. blog_posts_with_stats view - SECURITY DEFINER behavior (bypasses RLS)
-- 2. rate_limits table - RLS not enabled
-- 3. Functions with mutable search_path (schema injection vulnerability)
-- ============================================================================

-- ============================================================================
-- Fix 1: Recreate blog_posts_with_stats view with security_invoker
-- ============================================================================

DROP VIEW IF EXISTS public.blog_posts_with_stats;

CREATE VIEW public.blog_posts_with_stats
WITH (security_invoker = true) AS
SELECT
  bp.id,
  bp.title,
  bp.excerpt,
  bp.body,
  bp.published_at,
  bp.tags,
  bp.created_at,
  bp.updated_at,
  json_build_object(
    'id', p.id,
    'name', p.display_name,
    'avatarUrl', p.avatar_url
  ) as author,
  (SELECT COUNT(*) FROM public.post_likes pl WHERE pl.post_id = bp.id) as like_count,
  (SELECT COUNT(*) FROM public.comments c WHERE c.post_id = bp.id) as comment_count
FROM public.blog_posts bp
LEFT JOIN public.profiles p ON bp.author_id = p.id
WHERE bp.published_at IS NOT NULL AND bp.published_at <= NOW()
ORDER BY bp.published_at DESC;

-- ============================================================================
-- Fix 2: Enable RLS on rate_limits table
-- Only service_role (Edge Functions) should access this table
-- ============================================================================

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (for Edge Functions)
CREATE POLICY "Service role only"
  ON public.rate_limits
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- Fix 3: Recreate functions with SET search_path = '' to prevent schema injection
-- ============================================================================

-- 3a. Fix handle_new_user (SECURITY DEFINER - critical)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Anonymous'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 3b. Fix notify_on_comment_reply (SECURITY DEFINER - critical)
CREATE OR REPLACE FUNCTION public.notify_on_comment_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  parent_comment RECORD;
  commenter_name TEXT;
BEGIN
  -- Only create notification for replies (comments with parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    -- Get the parent comment
    SELECT c.user_id, p.display_name INTO parent_comment
    FROM public.comments c
    LEFT JOIN public.profiles p ON c.user_id = p.id
    WHERE c.id = NEW.parent_id;

    -- Only notify if parent has a user_id (not anonymous)
    -- and it's not the same user replying to themselves
    IF parent_comment.user_id IS NOT NULL
       AND parent_comment.user_id != NEW.user_id THEN

      -- Get commenter name
      SELECT display_name INTO commenter_name
      FROM public.profiles
      WHERE id = NEW.user_id;

      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        related_entity_type,
        related_entity_id,
        action_url,
        actor_id
      ) VALUES (
        parent_comment.user_id,
        'comment_reply',
        'New reply to your comment',
        COALESCE(commenter_name, 'Someone') || ' replied to your comment',
        'comment',
        NEW.id,
        '/post/' || NEW.post_id,
        NEW.user_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3c. Fix update_updated_at_column (SECURITY INVOKER - less critical but best practice)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3d. Fix generate_submission_slug (SECURITY INVOKER - less critical but best practice)
CREATE OR REPLACE FUNCTION public.generate_submission_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate slug if not already set and title is not empty
  IF NEW.slug IS NULL AND NEW.title != '' THEN
    -- Convert title to slug: lowercase, replace spaces with hyphens, remove special chars
    base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := substring(base_slug from 1 for 60); -- Limit length
    new_slug := base_slug;

    -- Check for uniqueness and append counter if needed
    WHILE EXISTS (SELECT 1 FROM public.submissions WHERE slug = new_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := new_slug;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- Note: Leaked Password Protection requires Supabase Dashboard configuration
-- Go to: Auth → Providers → Email → Enable "Leaked Password Protection"
-- This cannot be configured via migrations.
-- ============================================================================
