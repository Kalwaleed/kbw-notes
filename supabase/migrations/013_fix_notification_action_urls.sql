-- ============================================================================
-- Fix Notification Action URLs to use /kbw-notes/post/ prefix
-- ============================================================================

-- Update existing notifications with wrong URLs
UPDATE public.notifications
SET action_url = '/kbw-notes' || action_url
WHERE action_url LIKE '/post/%';

-- Replace the trigger function with corrected action_url
CREATE OR REPLACE FUNCTION public.notify_on_comment_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  parent_comment RECORD;
  commenter_name TEXT;
  recent_notification_count INTEGER;
BEGIN
  -- Recursion guard
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

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

      -- Rate limit: check for duplicate notifications in last minute
      SELECT COUNT(*) INTO recent_notification_count
      FROM public.notifications
      WHERE user_id = parent_comment.user_id
        AND type = 'comment_reply'
        AND related_entity_id = NEW.id
        AND created_at > NOW() - INTERVAL '1 minute';

      IF recent_notification_count > 0 THEN
        RETURN NEW;
      END IF;

      -- Get commenter name
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
        parent_comment.user_id,
        'comment_reply',
        'New reply to your comment',
        COALESCE(commenter_name, 'Someone') || ' replied to your comment',
        'comment',
        NEW.id,
        '/kbw-notes/post/' || NEW.post_id,
        NEW.user_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
