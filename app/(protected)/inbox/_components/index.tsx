"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RealtimeChat } from "@/components/realtime-chat";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { useUserFollowing } from "@/hooks/react-query/use-get-user-following";
import { useUserActiveChats } from "@/hooks/use-active-chats";
import { useUserById } from "@/hooks/react-query/get-user-by-id";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useChatUsers } from "@/hooks/react-query/use-chat-users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, Loader2 } from "lucide-react";
import { chatService } from "@/lib/supabase/service/chat-service";
import { useOnlineUsers } from "@/hooks/react-query/use-online-presence";
import { useQueryClient } from "@tanstack/react-query";

// ✅ Relative time formatter
function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  return d.toLocaleDateString();
}

export function Chat() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const messageUserId = searchParams.get("message");

  const { data: user } = useCurrentUserProfile();
  const { data: followingUsers = [] } = useUserFollowing(user?.user.id);
  const { data: activeChats, isLoading } = useUserActiveChats(user?.user.id);

  const [lastActive, setLastActive] = useState<string | null>(null);

  const chatUsers = useChatUsers(activeChats as []);

  console.log("active chats", activeChats);

  // fetch user if not in following list
  const { data: externalUser, isLoading: isExternalUserLoading } = useUserById(
    messageUserId && !followingUsers?.find((f) => f.id === messageUserId)
      ? messageUserId
      : null
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 👈 toggle for mobile
  const currentUser = user?.profile.username;

  useEffect(() => {
    if (selectedUser?.id) {
      const fetchLastActive = async () => {
        const { data } = await chatService.getUserLastActive(selectedUser.id);
        if (data?.last_active) {
          setLastActive(data.last_active);
        }
      };
      fetchLastActive();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser?.id && user?.user.id) {
      const roomName = chatService.getRoomName(user.user.id, selectedUser.id);
      chatService.markMessagesAsRead(roomName, user.user.id);
    }
  }, [selectedUser, user?.user.id]);

  // 👇 handle ?message=userid param OR auto-select most recent
  useEffect(() => {
    if (messageUserId) {
      const targetUser =
        followingUsers?.find((f) => f.id === messageUserId) ||
        externalUser ||
        chatUsers[messageUserId];
      setIsSidebarOpen(false);
      if (targetUser) {
        setSelectedUser(targetUser);
        return;
      }
    }

    // Default: auto-select most recent chat
    if (activeChats?.length) {
      const sorted = [...activeChats].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const recentChat = sorted[0];
      const recentUser =
        followingUsers?.find((f) => f.id === recentChat.otherUserId) ||
        chatUsers[recentChat.otherUserId];
      if (recentUser) setSelectedUser(recentUser);
    }
  }, [messageUserId, followingUsers, externalUser, chatUsers, activeChats]);

  useEffect(() => {
    if (selectedUser?.id && user?.user.id) {
      const roomName = chatService.getRoomName(user.user.id, selectedUser.id);

      // Mark messages as read with a small delay to ensure UI is ready
      const timer = setTimeout(() => {
        chatService.markMessagesAsRead(roomName, user.user.id);

        // Invalidate active chats query to refresh unread counts
        queryClient.invalidateQueries({
          queryKey: ["activeChats", user.user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["unreadCount", user.user.id],
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedUser, user?.user.id, queryClient]);

  const onlineUsers = useOnlineUsers();

  return (
    <div className="flex h-screen max-w-5xl mx-auto">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "block" : "hidden"
        } md:block md:w-64 w-full  flex flex-col`}
      >
        <div className="md:sticky md:top-16 bg-background z-10 flex flex-col">
          <div className="p-4">
            <h2 className="font-semibold mb-4 flex justify-between items-center md:text-3xl text-2xl">
              Chats
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                ✕
              </Button>
            </h2>

            {/* New Chat Selector */}
            <Select
              onValueChange={(userId) => {
                const u =
                  followingUsers?.find((f) => f.id === userId) ||
                  chatUsers[userId];
                if (u) {
                  setSelectedUser(u);
                  if (window.innerWidth < 768) setIsSidebarOpen(false); // auto-close on mobile
                }
              }}
            >
              <SelectTrigger className="w-full rounded-lg shadow-sm">
                <SelectValue placeholder="💬 Start a new chat..." />
              </SelectTrigger>
              <SelectContent>
                {followingUsers?.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Chats */}
          <div className="flex-1 space-y-2 overflow-y-auto p-4 pt-0">
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              activeChats?.map((chat: any) => {
                const otherUser =
                  followingUsers?.find((f) => f.id === chat.otherUserId) ||
                  chatUsers[chat.otherUserId];
                if (!otherUser) return null;

                const isActive = selectedUser?.id === otherUser.id;
                const hasUnread = chat.unread_count > 0;

                return (
                  <Card
                    key={chat.room_name}
                    className={`p-3 cursor-pointer border transition rounded-xl
          ${
            isActive
              ? "bg-primary/10 border-primary shadow-sm"
              : "hover:bg-muted"
          }
          ${hasUnread && !isActive ? "bg-blue-50 border-blue-200" : ""}
        `}
                    onClick={() => {
                      setSelectedUser(otherUser);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);

                      // Mark as read when selecting the chat
                      if (user?.user.id) {
                        chatService.markMessagesAsRead(
                          chat.room_name,
                          user.user.id
                        );
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 relative">
                        <AvatarImage
                          src={otherUser.avatar_preview}
                          alt={otherUser.username}
                        />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                        {onlineUsers.has(otherUser.id) && (
                          <span className="absolute bottom-0 z-10 right-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm truncate flex items-center gap-1">
                            {otherUser.username}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                            {chat.created_at
                              ? formatRelativeTime(chat.created_at)
                              : ""}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {chat.content
                            ? chat.content
                            : chat.created_at
                            ? "Attachment"
                            : "No message yet"}
                          {hasUnread && (
                            <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1 py-0.5 rounded">
                              {chat.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            }
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}

      <main
        className={`flex-1 flex flex-col relative ${
          isSidebarOpen ? "md:block hidden" : "block"
        }`}
      >
        {selectedUser ? (
          <>
            {/* Header with user avatar + info (sticky) */}
            <div className="border rounded-t-2xl bg-[#f8f8f8] px-4 py-3 flex border-b top-16 sticky z-10 items-center gap-3 shadow-sm text-foreground antialiased">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                ☰
              </Button>
              <Avatar className="w-10 h-10 relative">
                <AvatarImage
                  src={selectedUser.avatar_preview}
                  alt={selectedUser.username}
                  className="rounded-full"
                />
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
                {onlineUsers.has(selectedUser.id) && (
                  <span className="absolute bottom-0 right-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{selectedUser.username}</div>
                {selectedUser.first_name && (
                  <div className="text-sm text-muted-foreground">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {onlineUsers.has(selectedUser.id) ? (
                    <span className="text-green-600">Online now</span>
                  ) : lastActive ? (
                    <span>Last seen {formatRelativeTime(lastActive)}</span>
                  ) : (
                    <span>Offline</span>
                  )}
                </div>
              </div>
            </div>
            {/* Chat box scrollable area */}
            <div className="flex-1 overflow-y-auto pb-40">
              <RealtimeChat
                currentUserId={user?.user.id as string}
                otherUserId={selectedUser.id}
                username={currentUser as string}
                otherUsername={selectedUser.username}
              />
            </div>
          </>
        ) : isLoading || isExternalUserLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          !selectedUser &&
          activeChats?.length === 0 &&
          !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-40">
              <MessageSquare className="w-12 h-12 mb-3 text-muted-foreground" />
              <h3 className="font-semibold text-lg">No chat selected</h3>
              <p className="text-sm text-muted-foreground">
                Start a new conversation or select one from the sidebar.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
