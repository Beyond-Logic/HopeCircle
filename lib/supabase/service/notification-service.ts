// import type { Notification, NotificationType } from "@/types/notification";

import { createClient } from "../client";
import { createServiceClient } from "../service-client";

const supabase = createClient();

export const notificationService = {
  async createAdminNotification(userId: string, message: string) {
    const supabase = createServiceClient();

    const { data, error } = await supabase.from("notifications").insert({
      user_id: userId,
      type: "admin_announcement",
      title: "Admin Announcement",
      message: message,
    });

    return { data, error };
  },
  // Get notifications with pagination
  async getNotifications(
    userId: string,
    page = 0,
    limit = 20,
    filter: "all" | "unread" = "all"
  ) {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (filter === "unread") {
      query = query.eq("is_read", false);
    }

    query = query.range(page * limit, (page + 1) * limit - 1);

    const { data, error, count } = await query;

    return { data, error, count };
  },

  // Get unread notification count
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    return { count: count || 0, error };
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq("id", notificationId)
      .select()
      .single();

    return { data, error };
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false)
      .select();

    return { data, error };
  },

  // Delete a notification
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    return { error };
  },

  // Delete all notifications for a user
  async deleteAllNotifications(userId: string) {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    return { error };
  },

  // Subscribe to real-time notifications
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};
