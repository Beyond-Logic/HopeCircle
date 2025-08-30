// hooks/use-active-chats.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/lib/supabase/service/chat-service";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();


// In your use-active-chats hook
export function useUserActiveChats(userId: string) {
  return useQuery({
    queryKey: ["activeChats", userId],
    queryFn: async () => {
      const chats = await chatService.getUserActiveChats(userId);
      
      // Add unread count for each chat (excluding self-chats)
      const chatsWithUnread = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chats.map(async (chat: any) => {
          if (chat.isSelfChat) {
            return { ...chat, unread_count: 0 }; // Self-chats always have 0 unread
          }
          
          const roomName = chatService.getRoomName(userId, chat.otherUserId);
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("room_name", roomName)
            .eq("receiver_id", userId)
            .eq("is_read", false);
            
          return { ...chat, unread_count: count || 0 };
        })
      );
      
      return chatsWithUnread;
    },
    enabled: !!userId,
  });
}
