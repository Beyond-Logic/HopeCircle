"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useNotificationUnreadCount,
} from "@/hooks/react-query/use-notification";
import { Notification, NotificationGroup } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const { notifications, count } = useNotifications(activeTab);

  console.log("unread count", count);
  const { unreadCount } = useNotificationUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  // Group notifications by date
  const groupNotifications = (
    notifications: Notification[]
  ): NotificationGroup[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: NotificationGroup[] = [
      { title: "New", notifications: [] },
      { title: "Today", notifications: [] },
      { title: "Earlier", notifications: [] },
    ];

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.created_at);

      if (!notification.is_read) {
        groups[0].notifications.push(notification);
      } else if (notificationDate >= today) {
        groups[1].notifications.push(notification);
      } else {
        groups[2].notifications.push(notification);
      }
    });

    // Filter out empty groups
    return groups.filter((group) => group.notifications.length > 0);
  };

  const groupedNotifications = groupNotifications(notifications);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleDeleteNotification = (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();
    deleteNotification.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_follow":
        return "👤";
      case "post_like":
        return "❤️";
      case "comment_like":
        return "💬";
      case "new_comment":
      case "comment_reply":
        return "💭";
      case "post_tag":
        return "📍";
      case "group_invite":
      case "new_group_post":
      case "group_join": // Add the new type
        return "👥";
      default:
        return "🔔";
    }
  };

 const getNotificationLink = (notification: Notification) => {
   if (!notification.related_entity_type || !notification.related_entity_id) {
     return "/notifications";
   }

   switch (notification.related_entity_type) {
     case "user":
       return `/profile/${notification.related_entity_id}`;
     case "post":
       return `/post/${notification.related_entity_id}/?showComments=true#showComments`;
     case "comment":
       return `/post/${notification.related_entity_id}?showComments=true#showComments`;
     case "group":
       // For group join notifications, link directly to the group members page
       if (notification.type === "group_join") {
         return `/groups/${notification.related_entity_id}`;
       }
       return `/groups/${notification.related_entity_id}`;
     default:
       return "/notifications";
   }
 };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-primary/30"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="md:w-96 w-fit p-0" align="end" forceMount>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          </div>
        </div>

        <div className="flex border-b">
          <button
            type="button"
            title="all"
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              activeTab === "all"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            )}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            type="button"
            title="unread"
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              activeTab === "unread"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            )}
            onClick={() => setActiveTab("unread")}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <ScrollArea className="h-96">
          {groupedNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications found
            </div>
          ) : (
            groupedNotifications.map((group, groupIndex) => (
              <div key={groupIndex} className="">
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                  {group.title}
                </div>
                <DropdownMenuGroup>
                  {group.notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      // className="p-3 cursor-pointer flex flex-col items-start gap-1 border bg-transparent hover:bg-destructive/5"
                      className={cn(
                        "p-3 cursor-pointer flex flex-col items-start gap-1 bg-transparent hover:bg-destructive/5",
                        !notification.is_read &&
                          "bg-destructive/5 border-destructive/20"
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                      asChild
                      variant="destructive"
                    >
                      <Link href={getNotificationLink(notification)}>
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-start gap-3">
                            <span className="text-lg mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1">
                              <p
                                className={cn(
                                  "text-sm font-medium text-black",
                                  !notification.is_read && "text-primary"
                                )}
                              >
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(
                                  new Date(notification.created_at)
                                )}{" "}
                                ago
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) =>
                              handleDeleteNotification(notification.id, e)
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </div>
            ))
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="cursor-pointer justify-center text-primary"
            onClick={() => setIsOpen(false)}
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
