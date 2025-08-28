// hooks/use-active-chats.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/lib/supabase/service/chat-service";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();


export function useUserActiveChats(userId: string | undefined) {
  return useQuery({
    queryKey: ["activeChats", userId],
    queryFn: async () => {
      if (!userId) return [];
      const chats = await chatService.getUserActiveChats(userId);

      // Fetch unread counts for each chat room
      const withUnread = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chats.map(async (chat: any) => {
          // Get unread count for this specific chat room
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("room_name", chat.room_name)
            .eq("receiver_id", userId)
            .eq("is_read", false);

          return {
            ...chat,
            unread_count: count || 0,
          };
        })
      );

      return withUnread;
    },
    enabled: !!userId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}
