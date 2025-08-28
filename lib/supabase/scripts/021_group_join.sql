-- First drop the existing constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the new constraint with all allowed types including group_join
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'new_follow',
  'post_like', 
  'comment_like',
  'new_comment',
  'comment_reply',
  'post_tag',
  'group_invite',
  'new_group_post',
  'admin_announcement',
  'group_join'  -- New type added
));