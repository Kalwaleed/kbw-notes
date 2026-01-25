-- ============================================================================
-- Submissions Table for User Blog Post Drafts & Publishing
-- ============================================================================

-- Create submission status enum
CREATE TYPE submission_status AS ENUM ('draft', 'published');

-- Submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  slug TEXT UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status submission_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX idx_submissions_author_id ON public.submissions(author_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX idx_submissions_published_at ON public.submissions(published_at DESC) WHERE published_at IS NOT NULL;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Authors can view their own submissions (all statuses)
CREATE POLICY "Users can view own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = author_id);

-- Authors can insert their own submissions
CREATE POLICY "Users can insert own submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own submissions
CREATE POLICY "Users can update own submissions"
  ON public.submissions FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own submissions
CREATE POLICY "Users can delete own submissions"
  ON public.submissions FOR DELETE
  USING (auth.uid() = author_id);

-- Published submissions are viewable by everyone (for public blog)
CREATE POLICY "Published submissions are public"
  ON public.submissions FOR SELECT
  USING (status = 'published');

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique slug from title
CREATE OR REPLACE FUNCTION public.generate_submission_slug()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
CREATE TRIGGER generate_submission_slug_trigger
  BEFORE INSERT OR UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.generate_submission_slug();

-- ============================================================================
-- Storage Bucket for Post Images
-- ============================================================================

-- Create storage bucket for post images (requires Supabase dashboard or separate setup)
-- Note: Run this in Supabase SQL editor if bucket doesn't exist:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('post-images', 'post-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for post-images bucket (run after bucket is created):
-- CREATE POLICY "Authenticated users can upload images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "Anyone can view post images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'post-images');
--
-- CREATE POLICY "Users can delete own images"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
