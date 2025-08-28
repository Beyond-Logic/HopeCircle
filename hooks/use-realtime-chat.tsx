/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { chatService } from "@/lib/supabase/service/chat-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UseRealtimeChatProps {
  currentUserId: string;
  otherUserId: string;
  username: string;
  otherUsername: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  user: { name: string };
  createdAt: string;
  receiver_id?: string; // ✅ new
  is_read?: boolean; // ✅ new
}

export function useRealtimeChat({
  currentUserId,
  otherUserId,
  username,
  otherUsername,
}: UseRealtimeChatProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  const roomName = chatService.getRoomName(currentUserId, otherUserId);

  // 1️⃣ Fetch initial messages with React Query
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", roomName],
    queryFn: async () => {
      const { data } = await chatService.fetchMessages(
        currentUserId,
        otherUserId
      );
      return (
        data?.map((m: any) => ({
          id: m.id,
          content: m.content,
          createdAt: m.created_at,
          receiver_id: m.receiver_id, // ✅ keep for unread check
          is_read: m.is_read, // ✅ keep for unread check
          user: {
            name: m.sender_id === currentUserId ? username : otherUsername,
          },
        })) ?? []
      );
    },
  });

  // 2️⃣ Subscribe to new messages
  useEffect(() => {
    const subscription = chatService.subscribeToRoom(
      currentUserId,
      otherUserId,
      (msg) => {
        const mappedMsg: ChatMessage = {
          id: msg.id,
          content: msg.content,
          createdAt: msg.created_at,
          receiver_id: msg.receiver_id,
          is_read: msg.is_read,
          user: {
            name: msg.sender_id === currentUserId ? username : otherUsername,
          },
        };

        queryClient.setQueryData<ChatMessage[]>(
          ["messages", roomName],
          (old) => {
            if (!old) return [mappedMsg];
            // Deduplicate
            if (old.some((m) => m.id === mappedMsg.id)) return old;
            return [...old, mappedMsg];
          }
        );
      }
    );

    setIsConnected(true);

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [
    currentUserId,
    otherUserId,
    username,
    otherUsername,
    queryClient,
    supabase,
    roomName,
  ]);

  // Add this to your useEffect for realtime updates
  useEffect(() => {
    const subscription = supabase
      .channel(`messages:${roomName}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `room_name=eq.${roomName}`,
        },
        () => {
          // Handle message updates (like read status changes)
          queryClient.invalidateQueries({ queryKey: ["messages", roomName] });
          queryClient.invalidateQueries({
            queryKey: ["activeChats", currentUserId],
          });
          queryClient.invalidateQueries({
            queryKey: ["unreadCount", currentUserId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, currentUserId, queryClient]);

  // 3️⃣ Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const { data, error } = await chatService.sendMessage(
        currentUserId,
        otherUserId,
        content
      );

      if (error) {
        console.error("Failed to send message:", error);
        return;
      }

      // optimistic update
      const newMsg: ChatMessage = {
        id: (data as any)?.[0]?.id ?? Math.random().toString(), // fallback id
        content,
        createdAt: new Date().toISOString(),

        user: { name: username },
      };

      queryClient.setQueryData<ChatMessage[]>(["messages", roomName], (old) => {
        if (!old) return [newMsg];
        if (old.some((m) => m.id === newMsg.id)) return old; // dedupe
        return [...old, newMsg];
      });
    },
    [currentUserId, otherUserId, username, queryClient, roomName]
  );

  return { messages, sendMessage, isConnected };
}
