"use client";

import { cn } from "@/lib/utils";
import { ChatMessageItem } from "@/components/chat-message";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { type ChatMessage, useRealtimeChat } from "@/hooks/use-realtime-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card } from "./ui/card";
import { chatService } from "@/lib/supabase/service/chat-service";

interface RealtimeChatProps {
  currentUserId: string;
  otherUserId: string;
  username: string;
  otherUsername: string;
  onMessage?: (messages: ChatMessage[]) => void;
}

export const RealtimeChat = ({
  currentUserId,
  otherUserId,
  username,
  otherUsername,
  onMessage,
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll();

  const { messages, sendMessage, isConnected } = useRealtimeChat({
    currentUserId,
    otherUserId,
    username,
    otherUsername,
  });

  console.log("messages", messages);

  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (onMessage) onMessage(messages);
  }, [messages, onMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ✅ mark messages as read whenever new ones come in
  useEffect(() => {
    if (!messages.length) return;

    const roomName = chatService.getRoomName(currentUserId, otherUserId);

    // mark only if *I* am the receiver and not yet read
    const hasUnread = messages.some(
      (msg) => msg.receiver_id === currentUserId && !msg.is_read
    );

    console.log("hasUnread", hasUnread);

    if (hasUnread) {
      chatService.markMessagesAsRead(roomName, currentUserId);
    }
  }, [messages, currentUserId, otherUserId]);

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !isConnected) return;

      sendMessage(newMessage);
      setNewMessage("");
    },
    [newMessage, isConnected, sendMessage]
  );

  return (
    <Card className="flex p-6 flex-col h-full w-full bg-background text-foreground antialiased rounded-b-2xl rounded-t-none">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isConnected && (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        )}
        <div className="space-y-1">
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showHeader =
              !prevMessage || prevMessage.user.name !== message.user.name;

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ChatMessageItem
                  message={message}
                  isOwnMessage={message.user.name === username}
                  showHeader={showHeader}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex w-full gap-2 border-t border-border p-4"
      >
        <Input
          className={cn(
            "rounded-full bg-background text-sm transition-all duration-300",
            isConnected && newMessage.trim() ? "w-[calc(100%-36px)]" : "w-full"
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        {isConnected && newMessage.trim() && (
          <Button
            className="aspect-square mt-1.5 rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={!isConnected}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </Card>
  );
};
