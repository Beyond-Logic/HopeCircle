// hooks/use-user-by-id.ts
"use client";

import { chatService } from "@/lib/supabase/service/chat-service";
import { useQuery } from "@tanstack/react-query";

export function useUserById(userId?: string | null) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await chatService.getUserById(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId, // only run if userId is truthy
  });
}
