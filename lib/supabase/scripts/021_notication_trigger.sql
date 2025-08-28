-- Drop existing triggers first
DROP TRIGGER IF EXISTS trigger_notification_user_follows ON public.user_follows;
DROP TRIGGER IF EXISTS trigger_notification_post_likes ON public.post_likes;
DROP TRIGGER IF EXISTS trigger_notification_comment_likes ON public.comment_likes;
DROP TRIGGER IF EXISTS trigger_notification_comments ON public.comments;
DROP TRIGGER IF EXISTS trigger_notification_post_tags ON public.post_tags;
DROP TRIGGER IF EXISTS trigger_notification_group_members ON public.group_members;
DROP TRIGGER IF EXISTS trigger_notification_group_posts ON public.posts;

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