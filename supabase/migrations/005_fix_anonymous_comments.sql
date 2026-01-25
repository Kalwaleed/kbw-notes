-- ============================================================================
-- Fix Anonymous Comments (ensure user_id is nullable)
-- ============================================================================
-- Migration 003 may not have been applied. This ensures user_id allows NULL.

-- Make user_id nullable (idempotent - won't fail if already nullable)
DO $$
BEGIN
  -- Check if the column is NOT NULL and alter it
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'comments'
      AND column_name = 'user_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.comments ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Drop the old RLS policy if it still exists
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;

-- Add a comment on the column
COMMENT ON COLUMN public.comments.user_id IS 'User ID - nullable to allow anonymous comments';
