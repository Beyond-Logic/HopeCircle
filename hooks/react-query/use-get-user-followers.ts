// hooks/useUserFollowers.ts
import { userService } from "@/lib/supabase/service/users-service";
import { useQuery } from "@tanstack/react-query";

export function useUserFollowers(userId?: string) {
  return useQuery({
    queryKey: ["user-followers", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await userService.getUserFollowers(userId);
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!userId, // only runs when userId is provided
  });
}

export function useUserFollowing(userId?: string) {
  return useQuery({
    queryKey: ["user-following", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await userService.getUserFollowing(userId);
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!userId, // only runs when userId is provided
  });
}

