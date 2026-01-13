-- ============================================================================
-- Allow Anonymous Comments
-- ============================================================================
-- This migration makes user_id nullable in the comments table to allow
-- anonymous users to comment without authentication.

-- Drop the existing foreign key constraint and NOT NULL constraint
ALTER TABLE public.comments
  ALTER COLUMN user_id DROP NOT NULL;

-- Drop the old RLS policy for authenticated comment creation
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;

-- The Edge Function (moderate-comment) uses service role to insert comments,
-- so we don't need a new INSERT policy for anonymous users.
-- The service role bypasses RLS.

-- Update the comment on the table to reflect the new behavior
COMMENT ON TABLE public.comments IS 'Blog post comments - supports both authenticated and anonymous users';
