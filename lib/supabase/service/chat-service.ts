import { createClient } from "@/lib/supabase/client";
import { authService } from "./auth-service";

const supabase = createClient();

export const chatService = {
  getRoomName(userId1: string, userId2: string) {
    const sorted = [userId1, userId2].sort();
    return `${sorted[0]}_${sorted[1]}`;
  },

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const roomName = this.getRoomName(senderId, receiverId);
    const { data, error } = await supabase.from("messages").insert({
      room_name: roomName,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
    });
    return { data, error };
  },

  async fetchMessages(userId1: string, userId2: string) {
    const roomName = this.getRoomName(userId1, userId2);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_name", roomName)
      .order("created_at", { ascending: true });
    return { data, error };
  },

  subscribeToRoom(
    userId1: string,
    userId2: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (msg: any) => void
  ) {
    const roomName = this.getRoomName(userId1, userId2);
    return supabase
      .channel(`messages:${roomName}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_name=eq.${roomName}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },

  // 🆕 Get all active chats for a user
  // services/chat-service.ts
  async getUserActiveChats(userId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("room_name, sender_id, receiver_id, created_at, content")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Deduplicate by room_name, keep most recent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueRooms: Record<string, any> = {};
    for (const msg of data) {
      if (!uniqueRooms[msg.room_name]) {
        uniqueRooms[msg.room_name] = msg;
      }
    }

    // Attach "otherUserId" to each room
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.values(uniqueRooms).map((chat: any) => {
      const otherUserId =
        chat.sender_id === userId ? chat.receiver_id : chat.sender_id;
      return { ...chat, otherUserId };
    });
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, first_name, last_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) return { data: null, error };

    let avatar_preview: string | null = null;
    if (data?.avatar_url) {
      try {
        avatar_preview = await authService.getAvatarUrl(data.avatar_url);
      } catch {
        avatar_preview = null;
      }
    }

    return { data: { ...data, avatar_preview }, error: null };
  },

  async markMessagesAsRead(roomName: string, userId: string) {
    // mark messages as read where the current user is the receiver
    const { data, error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("room_name", roomName)
      .eq("receiver_id", userId)
      .eq("is_read", false);

    // Invalidate queries to refresh unread counts
    if (!error) {
      // You might want to trigger a query invalidation here
      console.log(error);
    }

    /// it is returning null null
    console.log(data, error, "check the mark as read ");

    /// it is returning null null
    return { data, error };
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("is_read", false);

    return { count: count ?? 0, error };
  },
};
