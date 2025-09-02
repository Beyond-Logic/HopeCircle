/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import {
  chatService,
  FileAttachment,
} from "@/lib/supabase/service/chat-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UseRealtimeChatProps {
  currentUserId: string;
  otherUserId: string;
  username: string;
  otherUsername: string;
  isSelfChat?: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  user: { name: string };
  createdAt: string;
  receiver_id?: string; // ✅ new
  is_read?: boolean; // ✅ new
  attachments?: FileAttachment[];
}

export function useRealtimeChat({
  currentUserId,
  otherUserId,
  username,
  otherUsername,
  isSelfChat = false,
}: UseRealtimeChatProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // For self-chat, we use a special room name and send to ourselves
  const actualOtherUserId = isSelfChat ? currentUserId : otherUserId;
  const actualOtherUsername = isSelfChat ? username : otherUsername;

  const roomName = chatService.getRoomName(currentUserId, actualOtherUserId);

  // 1️⃣ Fetch initial messages with React Query
  const { data: messages = [], isLoading: isQueryLoading } = useQuery({
    queryKey: ["messages", roomName],
    queryFn: async () => {
      const { data } = await chatService.fetchMessages(
        currentUserId,
        actualOtherUserId
      );
      return (
        data?.map((m: any) => ({
          id: m.id,
          content: m.content,
          createdAt: m.created_at,
          receiver_id: m.receiver_id,
          is_read: m.is_read,
          attachments: m.attachments || [],
          user: {
            name:
              m.sender_id === currentUserId ? username : actualOtherUsername,
          },
        })) ?? []
      );
    },
  });

  // 2️⃣ Subscribe to new messages
  useEffect(() => {
    const subscription = chatService.subscribeToRoom(
      currentUserId,
      actualOtherUserId,
      (msg) => {
        const mappedMsg: ChatMessage = {
          id: msg.id,
          content: msg.content,
          createdAt: msg.created_at,
          receiver_id: msg.receiver_id,
          is_read: msg.is_read,
          attachments: msg.attachments || [],
          user: {
            name:
              msg.sender_id === currentUserId ? username : actualOtherUsername,
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
    setIsLoading(false); // Set loading to false when connected

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [
    currentUserId,
    actualOtherUserId,
    username,
    actualOtherUsername,
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

  // 3️⃣ Send message with files

  const sendMessage = useCallback(
    async (content: string, files: File[] = []) => {
      if (!content.trim() && files.length === 0) return;

      try {
        // 🆕 Generate signed URLs for files before sending
        let attachmentsWithSignedUrls: FileAttachment[] = [];
        if (files.length > 0) {
          attachmentsWithSignedUrls = await Promise.all(
            files.map((file) =>
              chatService.uploadFile(file, roomName, currentUserId)
            )
          );
        }

        const { data, error } = await chatService.sendMessage(
          currentUserId,
          actualOtherUserId,
          content,
          [], // Pass empty files array since we already uploaded them
          attachmentsWithSignedUrls // Pass the pre-uploaded attachments
        );

        if (error) {
          console.error("Failed to send message:", error);
          return;
        }

        // Optimistic update with signed URLs
        const newMsg: ChatMessage = {
          id: (data as any)?.[0]?.id ?? Math.random().toString(),
          content,
          createdAt: new Date().toISOString(),
          attachments: attachmentsWithSignedUrls, // Use the signed URLs
          user: { name: username },
        };

        queryClient.setQueryData<ChatMessage[]>(
          ["messages", roomName],
          (old) => {
            if (!old) return [newMsg];
            if (old.some((m) => m.id === newMsg.id)) return old;
            return [...old, newMsg];
          }
        );
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [currentUserId, actualOtherUserId, username, queryClient, roomName]
  );

  return {
    messages,
    sendMessage,
    isConnected,
    isLoading: isLoading || isQueryLoading,
  };
}
