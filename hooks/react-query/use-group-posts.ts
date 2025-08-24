// hooks/useGroupPosts.ts
import { useQuery } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";
import type { Post } from "@/types/post";

export const useGroupPosts = (groupId: string, page = 0, limit = 10) => {
  return useQuery<Post[], Error>({
    queryKey: ["groupPosts", groupId, page, limit],
    queryFn: async () => {
      const { data, error } = await groupService.getGroupPosts(
        groupId,
        page,
        limit
      );
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000, // 1 minute
    // placeholderData: (previousData) => previousData, // good for pagination
    refetchOnWindowFocus: false,
  });
};
