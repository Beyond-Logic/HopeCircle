import { userService } from "@/lib/supabase/service/users-service";
import { useQuery } from "@tanstack/react-query";

export function useUserFollowing(userId?: string) {
  return useQuery({
    queryKey: ["single-follower", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await userService.getUserFollowing(userId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId,
  });
}
