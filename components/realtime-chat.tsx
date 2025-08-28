"use client";

import { cn } from "@/lib/utils";
import { ChatMessageItem } from "@/components/chat-message";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { type ChatMessage, useRealtimeChat } from "@/hooks/use-realtime-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Paperclip, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { chatService, FILE_LIMITS } from "@/lib/supabase/service/chat-service";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "./ui/alert";

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
  const queryClient = useQueryClient();

  const { messages, sendMessage, isConnected } = useRealtimeChat({
    currentUserId,
    otherUserId,
    username,
    otherUsername,
  });

  console.log("messages", messages);

  const [newMessage, setNewMessage] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    async (e: React.FormEvent) => {
      e.preventDefault();
      if ((!newMessage.trim() && selectedFiles.length === 0) || !isConnected)
        return;

      try {
        await sendMessage(newMessage, selectedFiles);
        setNewMessage("");
        setSelectedFiles([]);
        setUploadError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setUploadError(error.message || "Failed to send message");
        setTimeout(() => setUploadError(null), 5000);
      }
    },
    [newMessage, selectedFiles, isConnected, sendMessage]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const fileCategory = chatService.getFileCategory(file.type);
      const maxSize = FILE_LIMITS[fileCategory];

      if (file.size > maxSize) {
        errors.push(
          `${file.name}: Maximum size for ${fileCategory} is ${
            maxSize / 1024 / 1024
          }MB`
        );
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join("\n"));
      setTimeout(() => setUploadError(null), 5000);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteMessage = () => {
    queryClient.invalidateQueries({ queryKey: ["messages"] });
    queryClient.invalidateQueries({
      queryKey: ["activeChats", currentUserId],
    });
  };

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
                  onDelete={handleDeleteMessage}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <Alert variant="destructive" className="mx-4 mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* File previews */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-muted/50">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg border text-sm"
              >
                <Paperclip className="w-4 h-4 flex-shrink-0" />
                <span className="truncate max-w-xs">{file.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex w-full gap-2 border-t border-border p-4"
      >
        <input
          title="files"
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.rtf,.csv,.xls,.xlsx"
          multiple
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <Input
          className={cn(
            "rounded-full bg-background text-sm transition-all duration-300",
            isConnected && newMessage.trim() ? "w-[calc(100%-36px)]" : "w-full"
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`${
            selectedFiles.length > 0
              ? `Include a message to send ${
                  selectedFiles.length > 1 ? "files" : "file"
                }`
              : "Type a message..."
          }`}
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
