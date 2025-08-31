"use client";

import { cn } from "@/lib/utils";
import { ChatMessageItem } from "@/components/chat-message";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { type ChatMessage, useRealtimeChat } from "@/hooks/use-realtime-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Paperclip,
  Send,
  X,
  MoreVertical,
  CornerDownLeft,
  MousePointerClick,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { chatService, FILE_LIMITS } from "@/lib/supabase/service/chat-service";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "./ui/textarea";

interface RealtimeChatProps {
  currentUserId: string;
  otherUserId: string;
  username: string;
  otherUsername: string;
  isSelfChat?: boolean;
  onMessage?: (messages: ChatMessage[]) => void;
}

export const RealtimeChat = ({
  currentUserId,
  otherUserId,
  username,
  otherUsername,
  isSelfChat = false,
  onMessage,
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll();
  const queryClient = useQueryClient();

  const {
    messages,
    sendMessage,
    isConnected,
    isLoading: isChatLoading,
  } = useRealtimeChat({
    currentUserId,
    otherUserId: isSelfChat ? currentUserId : otherUserId,
    username,
    otherUsername: isSelfChat ? username : otherUsername,
    isSelfChat,
  });

  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [sendWithEnter, setSendWithEnter] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chat-send-method");
      return saved ? saved === "enter" : true; // default to enter
    }
    return true;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSendOptions, setShowSendOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("chat-send-method", sendWithEnter ? "enter" : "click");
  }, [sendWithEnter]);

  useEffect(() => {
    if (onMessage) onMessage(messages);
  }, [messages, onMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!messages.length || isSelfChat) return;

    const roomName = chatService.getRoomName(currentUserId, otherUserId);
    const hasUnread = messages.some(
      (msg) => msg.receiver_id === currentUserId && !msg.is_read
    );

    if (hasUnread) {
      chatService.markMessagesAsRead(roomName, currentUserId);
    }
  }, [messages, currentUserId, otherUserId, isSelfChat]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      setIsLoading(true);
      e.preventDefault();
      if ((!newMessage.trim() && selectedFiles.length === 0) || !isConnected)
        return;

      try {
        await sendMessage(newMessage, selectedFiles);
        setNewMessage("");
        setSelectedFiles([]);
        setUploadError(null);
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setUploadError(error.message || "Failed to send message");
        setTimeout(() => setUploadError(null), 5000);
        setIsLoading(false);
      }
    },
    [newMessage, selectedFiles, isConnected, sendMessage]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

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
    setSelectedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return newFiles;
    });
  };

  const handleDeleteMessage = (deletedMessageId: string) => {
    queryClient.invalidateQueries({ queryKey: ["messages"] });
    queryClient.invalidateQueries({
      queryKey: ["activeChats", currentUserId],
    });

    const isMostRecent =
      messages.length > 0 &&
      messages[messages.length - 1].id === deletedMessageId;

    if (isMostRecent && onMessage) {
      onMessage(messages.filter((m) => m.id !== deletedMessageId));
    }
  };

  useEffect(() => {
    setNewMessage("");
    setSelectedFiles([]);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [currentUserId, otherUserId]);

  const canSend =
    isConnected && (newMessage.trim() || selectedFiles.length > 0);

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowSendOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Card className="flex p-6 flex-col md:max-h-[700px] w-full bg-background text-foreground antialiased rounded-b-2xl rounded-t-none border-1">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isChatLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            {isSelfChat
              ? "Write down your thoughts, ideas, or feelings — just for you."
              : "No messages yet. Start the conversation!"}
          </div>
        ) : (
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
                    onDelete={() => handleDeleteMessage(message.id)}
                    isSelfChat={isSelfChat}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {uploadError && (
        <Alert variant="destructive" className="mx-4 mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{uploadError}</AlertDescription>
        </Alert>
      )}

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

      <form
        onSubmit={handleSendMessage}
        className="flex sm:flex-row flex-col-reverse w-full gap-2 border-t border-border p-4 sm:items-center"
      >
        <div className="flex">
          <div>
            <input
              title="files"
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.rtf,.csv,.xls,.xlsx"
              multiple
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach files</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {/* Three-dot menu for send options */}
          <div className="relative" ref={optionsRef}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSendOptions(!showSendOptions)}
                    className="mt-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {showSendOptions && (
              <div className="absolute bottom-full mb-2 left-0 bg-background border rounded-lg shadow-lg z-10 p-2 w-48">
                <div className="text-sm font-medium mb-2">Send Message</div>
                <div className="space-y-1">
                  <button
                    type="button"
                    className={`w-full text-left px-2 py-2 rounded text-sm flex items-center gap-2 ${
                      sendWithEnter
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSendWithEnter(true);
                      setShowSendOptions(false);
                    }}
                  >
                    <CornerDownLeft className="w-4 h-4" />
                    <div className="flex flex-col items-start">
                      <span>Press Enter to Send</span>
                      <span className="text-xs opacity-70">
                        Pressing Enter will send message
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`w-full text-left px-2 py-2 rounded text-sm flex items-center gap-2 ${
                      !sendWithEnter
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSendWithEnter(false);
                      setShowSendOptions(false);
                    }}
                  >
                    <MousePointerClick className="w-4 h-4" />
                    <div className="flex flex-col items-start">
                      <span>Click Send</span>
                      <span className="text-xs opacity-70">
                        Clicking Send will send message
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full">
          {sendWithEnter ? (
            <Input
              className={cn(
                "rounded-full bg-background text-sm transition-all duration-300 mt-2 flex-1"
              )}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as unknown as React.FormEvent);
                }
              }}
              placeholder={
                selectedFiles.length > 0
                  ? "Add a message (optional)"
                  : "Type a message..."
              }
              disabled={!isConnected}
            />
          ) : (
            <Textarea
              className={cn(
                "rounded-xl bg-background text-sm transition-all duration-300 mt-2 flex-1 resize-none px-4 py-2 focus:outline-none disabled:opacity-50"
              )}
              rows={1}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                selectedFiles.length > 0
                  ? "Add a message (optional)"
                  : "Type a message..."
              }
              disabled={!isConnected}
            />
          )}

          {canSend && (
            <Button
              className="aspect-square mt-2 rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
              type="submit"
              disabled={!canSend || isLoading}
            >
              <Send className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};
