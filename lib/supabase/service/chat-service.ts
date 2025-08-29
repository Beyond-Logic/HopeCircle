import { createClient } from "@/lib/supabase/client";
import { authService } from "./auth-service";

const supabase = createClient();

// File type categories and size limits
export const FILE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 20 * 1024 * 1024, // 20MB
  document: 10 * 1024 * 1024, // 10MB
  other: 5 * 1024 * 1024, // 5MB
};

export const FILE_CATEGORIES = {
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  video: ["video/mp4", "video/webm", "video/ogg"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
  key: string;
}

export const chatService = {
  FILE_LIMITS,
  FILE_CATEGORIES,
  getRoomName(userId1: string, userId2: string) {
    const sorted = [userId1, userId2].sort();
    return `${sorted[0]}_${sorted[1]}`;
  },

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    files: File[] = []
  ) {
    const roomName = this.getRoomName(senderId, receiverId);

    let attachments: FileAttachment[] = [];
    if (files.length > 0) {
      attachments = await Promise.all(
        files.map((file) => this.uploadFile(file, roomName, senderId))
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_name: roomName,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        attachments: attachments.length > 0 ? attachments : null,
      })
      .select();

    return { data, error };
  },

  async uploadFile(
    file: File,
    roomName: string,
    userId: string
  ): Promise<FileAttachment> {
    // Validate file
    const fileCategory = this.getFileCategory(file.type);
    const maxSize = FILE_LIMITS[fileCategory];

    if (file.size > maxSize) {
      throw new Error(
        `File too large. Maximum size for ${fileCategory} is ${
          maxSize / 1024 / 1024
        }MB`
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `chats/${roomName}/${userId}/${timestamp}_${randomStr}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-files").getPublicUrl(fileName);

    return {
      name: file.name,
      type: file.type,
      size: file.size,
      url: publicUrl,
      key: fileName,
    };
  },

  getFileCategory(mimeType: string): keyof typeof FILE_LIMITS {
    for (const [category, types] of Object.entries(FILE_CATEGORIES)) {
      if (types.includes(mimeType)) {
        return category as keyof typeof FILE_LIMITS;
      }
    }
    return "other";
  },

  async deleteMessage(messageId: string, userId: string) {
    // First verify user owns the message and get attachments
    const { data: message } = await supabase
      .from("messages")
      .select("attachments, sender_id, room_name")
      .eq("id", messageId)
      .eq("sender_id", userId)
      .single();

    if (!message) {
      throw new Error("Message not found or unauthorized");
    }

    // Delete associated files if they exist
    if (message.attachments && Array.isArray(message.attachments)) {
      const fileKeys = message.attachments
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((att: any) => att.key)
        .filter(Boolean);
      if (fileKeys.length > 0) {
        await supabase.storage.from("chat-files").remove(fileKeys);
      }
    }

    // Delete message
    const { data, error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", userId);

    return { data, error };
  },

  async reportMessage(
    messageId: string,
    reportedBy: string,
    reason: string,
    description?: string
  ) {
    const { data, error } = await supabase
      .from("message_reports")
      .insert({
        message_id: messageId,
        reported_by: reportedBy,
        reason,
        description,
      })
      .select();

    return { data, error };
  },

  async getUserLastActive(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("last_active")
      .eq("id", userId)
      .single();

    return { data, error };
  },

  async updateUserLastActive(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .update({ last_active: new Date().toISOString() })
      .eq("id", userId)
      .select("last_active")
      .single();

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
    }

    /// it is returning null null

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
