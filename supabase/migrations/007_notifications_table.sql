-- ============================================================================
-- Notifications System
-- ============================================================================

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'comment_reply',        -- Someone replied to your comment
  'submission_comment',   -- Someone commented on your submission
  'submission_like',      -- Someone liked your submission
  'mention'               -- Someone @mentioned you
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type TEXT,  -- 'comment', 'submission', 'post'
  related_entity_id UUID,
  action_url TEXT,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert notifications for any user (via service role)
-- Users cannot insert notifications directly
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Enable Realtime for live notification updates
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- Trigger Function for Comment Reply Notifications
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_on_comment_reply()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment replies
CREATE TRIGGER on_comment_reply
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment_reply();
