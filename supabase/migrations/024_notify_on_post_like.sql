-- ============================================================================
-- Notify post author when someone (else) likes their post
-- ============================================================================
--
-- The notifications enum already includes `submission_like`. We just lacked
-- a trigger to fire it on insert into post_likes. Self-likes are skipped
-- so users never notify themselves.

CREATE OR REPLACE FUNCTION public.notify_on_post_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  post_title TEXT;
  liker_name TEXT;
BEGIN
  -- Look up submission author + title
  SELECT s.author_id, s.title INTO post_author_id, post_title
  FROM public.submissions s
  WHERE s.id = NEW.post_id;

  -- Skip if no author (orphan row, shouldn't happen with FK CASCADE)
  IF post_author_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip self-likes
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Resolve liker display name (best effort)
  SELECT display_name INTO liker_name
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
    post_author_id,
    'submission_like',
    'Your post was liked',
    COALESCE(liker_name, 'Someone') || ' liked "' || COALESCE(post_title, 'your post') || '"',
    'submission',
    NEW.post_id,
    '/kbw-notes/post/' || NEW.post_id,
    NEW.user_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_post_like ON public.post_likes;
CREATE TRIGGER on_post_like
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_post_like();
