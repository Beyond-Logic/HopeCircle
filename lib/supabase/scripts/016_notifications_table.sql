-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'new_follow',
    'post_like',
    'comment_like',
    'new_comment',
    'comment_reply',
    'post_tag',
    'group_invite',
    'new_group_post',
    'admin_announcement'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50) CHECK (related_entity_type IN (
    'user', 'post', 'comment', 'group'
  )),
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create notifications for various events
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_title VARCHAR(255);
  notification_message TEXT;
  notification_type VARCHAR(50);
  related_type VARCHAR(50);
  related_id UUID;
  recipient_id UUID;
BEGIN
  -- Determine notification details based on the table that triggered the event
  IF TG_TABLE_NAME = 'user_follows' THEN
    notification_type := 'new_follow';
    notification_title := 'New Follower';
    notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.follower_id) || ' started following you';
    related_type := 'user';
    related_id := NEW.follower_id;
    recipient_id := NEW.following_id;
  
  ELSIF TG_TABLE_NAME = 'post_likes' THEN
    notification_type := 'post_like';
    notification_title := 'Post Liked';
    notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.user_id) || ' liked your post';
    related_type := 'post';
    related_id := NEW.post_id;
    recipient_id := (SELECT author_id FROM posts WHERE id = NEW.post_id);
  
  ELSIF TG_TABLE_NAME = 'comment_likes' THEN
    notification_type := 'comment_like';
    notification_title := 'Comment Liked';
    notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.user_id) || ' liked your comment';
    related_type := 'comment';
    related_id := NEW.comment_id;
    recipient_id := (SELECT author_id FROM comments WHERE id = NEW.comment_id);
  
  ELSIF TG_TABLE_NAME = 'comments' THEN
    -- Check if it's a reply to a comment
    IF NEW.parent_comment_id IS NOT NULL THEN
      notification_type := 'comment_reply';
      notification_title := 'Reply to Your Comment';
      notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.author_id) || ' replied to your comment';
      related_type := 'comment';
      related_id := NEW.id;
      recipient_id := (SELECT author_id FROM comments WHERE id = NEW.parent_comment_id);
    ELSE
      notification_type := 'new_comment';
      notification_title := 'New Comment';
      notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.author_id) || ' commented on your post';
      related_type := 'post';
      related_id := NEW.post_id;
      recipient_id := (SELECT author_id FROM posts WHERE id = NEW.post_id);
    END IF;
  
  ELSIF TG_TABLE_NAME = 'post_tags' THEN
    notification_type := 'post_tag';
    notification_title := 'You Were Mentioned';
    notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = (SELECT author_id FROM posts WHERE id = NEW.post_id)) || ' mentioned you in a post';
    related_type := 'post';
    related_id := NEW.post_id;
    recipient_id := NEW.tagged_user_id;
  
  ELSIF TG_TABLE_NAME = 'group_members' THEN
    notification_type := 'group_invite';
    notification_title := 'Group Invitation';
    notification_message := 'You were added to the group: ' || (SELECT name FROM groups WHERE id = NEW.group_id);
    related_type := 'group';
    related_id := NEW.group_id;
    recipient_id := NEW.user_id;
  
  ELSIF TG_TABLE_NAME = 'posts' AND NEW.group_id IS NOT NULL THEN
    notification_type := 'new_group_post';
    notification_title := 'New Group Post';
    notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.author_id) || ' posted in ' || (SELECT name FROM groups WHERE id = NEW.group_id);
    related_type := 'post';
    related_id := NEW.id;
    
    -- Get all group members except the post author
    FOR recipient_id IN 
      SELECT user_id FROM group_members 
      WHERE group_id = NEW.group_id AND user_id != NEW.author_id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, related_entity_type, related_entity_id)
      VALUES (recipient_id, notification_type, notification_title, notification_message, related_type, related_id);
    END LOOP;
    
    RETURN NEW;
  END IF;

  -- Insert the notification if we have a recipient
  IF recipient_id IS NOT NULL AND recipient_id != (SELECT id FROM users WHERE id = (SELECT auth.uid())) THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_entity_type, related_entity_id)
    VALUES (recipient_id, notification_type, notification_title, notification_message, related_type, related_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for notification generation
CREATE TRIGGER trigger_notification_user_follows
  AFTER INSERT ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER trigger_notification_post_likes
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER trigger_notification_comment_likes
  AFTER INSERT ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER trigger_notification_comments
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER trigger_notification_post_tags
  AFTER INSERT ON public.post_tags
  FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER trigger_notification_group_members
  AFTER INSERT ON public.group_members
  FOR EACH ROW EXECUTE FUNCTION create_notification();

CREATE TRIGGER trigger_notification_group_posts
  AFTER INSERT ON public.posts
  FOR EACH ROW WHEN (NEW.group_id IS NOT NULL)
  EXECUTE FUNCTION create_notification();