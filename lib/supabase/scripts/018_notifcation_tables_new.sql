CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_title VARCHAR(255);
  notification_message TEXT;
  notification_type VARCHAR(50);
  related_type VARCHAR(50);
  related_id UUID;
  recipient_id UUID;
  post_author_id UUID;
  comment_author_id UUID;
  group_creator UUID;
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
    
    -- Get post author
    SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
    recipient_id := post_author_id;
  
  ELSIF TG_TABLE_NAME = 'comment_likes' THEN
    notification_type := 'comment_like';
    notification_title := 'Comment Liked';
    notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.user_id) || ' liked your comment';
    related_type := 'comment';
    related_id := NEW.comment_id;
    
    -- Get comment author
    SELECT author_id INTO comment_author_id FROM comments WHERE id = NEW.comment_id;
    recipient_id := comment_author_id;
  
  ELSIF TG_TABLE_NAME = 'comments' THEN
    -- Check if it's a reply to a comment
    IF NEW.parent_comment_id IS NOT NULL THEN
      notification_type := 'comment_reply';
      notification_title := 'Reply to Your Comment';
      notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.author_id) || ' replied to your comment';
      related_type := 'comment';
      related_id := NEW.id;
      
      -- Get parent comment author
      SELECT author_id INTO comment_author_id FROM comments WHERE id = NEW.parent_comment_id;
      recipient_id := comment_author_id;
    ELSE
      notification_type := 'new_comment';
      notification_title := 'New Comment';
      notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.author_id) || ' commented on your post';
      related_type := 'post';
      related_id := NEW.post_id;
      
      -- Get post author
      SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
      recipient_id := post_author_id;
    END IF;
  
  ELSIF TG_TABLE_NAME = 'post_tags' THEN
    notification_type := 'post_tag';
    notification_title := 'You Were Mentioned';
    notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = (SELECT author_id FROM posts WHERE id = NEW.post_id)) || ' mentioned you in a post';
    related_type := 'post';
    related_id := NEW.post_id;
    recipient_id := NEW.tagged_user_id;
  
  ELSIF TG_TABLE_NAME = 'group_members' THEN
    -- Check if this is a group invitation (user being added by someone else)
    IF (SELECT auth.uid()) != NEW.user_id THEN
      notification_type := 'group_invite';
      notification_title := 'Group Invitation';
      notification_message := 'You were added to the group: ' || (SELECT name FROM groups WHERE id = NEW.group_id);
      related_type := 'group';
      related_id := NEW.group_id;
      recipient_id := NEW.user_id;
    ELSE
      -- This is a user joining a group themselves - notify group admin(s)
      notification_type := 'group_join';
      notification_title := 'New Group Member';
      notification_message := (SELECT first_name || ' ' || last_name FROM users WHERE id = NEW.user_id) || ' joined your group: ' || (SELECT name FROM groups WHERE id = NEW.group_id);
      related_type := 'group';
      related_id := NEW.group_id;
      
      -- Get group creator to notify them
      SELECT created_by INTO group_creator FROM groups WHERE id = NEW.group_id;
      recipient_id := group_creator;
      
      -- Also notify other group admins/moderators if you want
      -- FOR recipient_id IN 
      --   SELECT user_id FROM group_members 
      --   WHERE group_id = NEW.group_id AND role IN ('admin', 'moderator') AND user_id != NEW.user_id
      -- LOOP
      --   PERFORM create_notification_safe(
      --     recipient_id, 
      --     notification_type, 
      --     notification_title, 
      --     notification_message, 
      --     related_type, 
      --     related_id
      --   );
      -- END LOOP;
      -- RETURN NEW;
    END IF;
  
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
      -- Use the secure function for each recipient
      PERFORM create_notification_safe(
        recipient_id, 
        notification_type, 
        notification_title, 
        notification_message, 
        related_type, 
        related_id
      );
    END LOOP;
    
    RETURN NEW;
  END IF;

  -- Insert the notification if we have a recipient and it's not the current user
  IF recipient_id IS NOT NULL AND recipient_id != (SELECT id FROM users WHERE id = (SELECT auth.uid())) THEN
    PERFORM create_notification_safe(
      recipient_id, 
      notification_type, 
      notification_title, 
      notification_message, 
      related_type, 
      related_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;