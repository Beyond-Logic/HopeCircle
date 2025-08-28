export type NotificationType =
  | "new_follow"
  | "post_like"
  | "comment_like"
  | "new_comment"
  | "comment_reply"
  | "post_tag"
  | "group_invite"
  | "new_group_post"
  | "admin_announcement";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_entity_type?: "user" | "post" | "comment" | "group";
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationGroup {
  title: string;
  notifications: Notification[];
}
