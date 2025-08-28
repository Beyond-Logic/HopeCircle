import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/lib/supabase/service/notification-service";
import { useAuth } from "@/context/authContext";
import { useEffect } from "react";

export const useNotifications = (
  filter: "all" | "unread" = "all",
  page = 0
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", user?.id, filter, page],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };
      const { data, count } = await notificationService.getNotifications(
        user.id,
        page,
        20,
        filter
      );
      return { data: data || [], count: count || 0 };
    },
    enabled: !!user?.id,
  });

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const subscription = notificationService.subscribeToNotifications(
      user.id,
      () => {
        queryClient.invalidateQueries({
          queryKey: ["notifications", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["unreadCount", user.id],
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, queryClient]);

  return {
    notifications: notifications?.data || [],
    count: notifications?.count || 0,
    isLoading,
    error,
    refetch,
  };
};

export const useUnreadCount = () => {
  const { user } = useAuth();

  const { data: unreadCount = 0, isLoading } = useQuery({
    queryKey: ["unreadCount", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await notificationService.getUnreadCount(user.id);
      return count;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return { unreadCount, isLoading };
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadCount", user?.id],
      });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("User not authenticated");
      return notificationService.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadCount", user?.id],
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadCount", user?.id],
      });
    },
  });
};
