/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Trash2, Bell } from "lucide-react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/react-query/use-notification";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function Notifications() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(0);

  const { notifications, count, isLoading } = useNotifications(activeTab, page);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const hasMore = count > notifications.length;

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getNotificationLink = (notification: any) => {
    if (!notification.related_entity_type || !notification.related_entity_id) {
      return "#";
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
        return "#";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 text-[15px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="md:text-3xl text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => markAllAsRead.mutate()}
            disabled={notifications.filter((n) => !n.is_read).length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 text-[15px]">
        <button
          type="button"
          className={cn(
            "px-4 py-2 rounded-md font-medium",
            activeTab === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
          onClick={() => {
            setActiveTab("all");
            setPage(0);
          }}
        >
          All ({count})
        </button>
        <button
          type="button"
          className={cn(
            "px-4 py-2 rounded-md font-medium",
            activeTab === "unread"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
          onClick={() => {
            setActiveTab("unread");
            setPage(0);
          }}
        >
          Unread ({notifications.filter((n) => !n.is_read).length})
        </button>
      </div>

      {!isLoading && notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">
            When you get notifications, they'll appear here.
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border bg-transparent hover:bg-destructive/5",
                    !notification.is_read &&
                      "bg-destructive/5 border-destructive/20"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl mt-1">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <Link
                          href={getNotificationLink(notification)}
                          className="block"
                        >
                          <h3
                            className={cn(
                              "font-medium",
                              !notification.is_read && "text-primary"
                            )}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(
                              new Date(notification.created_at)
                            )}{" "}
                            ago
                          </p>
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead.mutate(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          deleteNotification.mutate(notification.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {hasMore && (
            <div className="mt-6 text-center">
              <Button onClick={handleLoadMore} variant="outline">
                Load more notifications
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
