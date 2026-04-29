-- ============================================================================
-- Notify post author when someone comments directly on their published post
-- ============================================================================
--
-- Reply notifications already exist via notify_on_comment_reply(). This trigger
-- covers top-level comments, which use the `submission_comment` notification
-- type and were previously not generated.

CREATE OR REPLACE FUNCTION public.notify_on_submission_comment()
RETURNS TRIGGER AS $$
DECLARE
  submission_author_id UUID;
  submission_title TEXT;
  commenter_name TEXT;
BEGIN
  -- Reply notifications are handled by notify_on_comment_reply().
  IF NEW.parent_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT s.author_id, s.title INTO submission_author_id, submission_title
  FROM public.submissions s
  WHERE s.id = NEW.post_id;

  IF submission_author_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip comments by the post author.
  IF NEW.user_id IS NOT NULL AND submission_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS NOT NULL THEN
    SELECT display_name INTO commenter_name
    FROM public.profiles
    WHERE id = NEW.user_id;
  END IF;

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
    submission_author_id,
    'submission_comment',
    'New comment on your post',
    COALESCE(commenter_name, 'Someone') || ' commented on "' || COALESCE(submission_title, 'your post') || '"',
    'comment',
    NEW.id,
    '/kbw-notes/post/' || NEW.post_id,
    NEW.user_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_submission_comment ON public.comments;
CREATE TRIGGER on_submission_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_submission_comment();
