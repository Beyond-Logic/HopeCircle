// hooks/useGroups.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";

export const useGroups = (
  limit = 21,
  type?: "country" | "theme" | "all", // Removed "joined"
  search?: string,
  userId?: string
) => {
  return useInfiniteQuery({
    queryKey: ["groups", { type, search, limit, userId }],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, count, error } = await groupService.getGroups(
        pageParam,
        limit,
        type,
        search,
        userId
      );
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0, page: pageParam };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const total = lastPage.count ?? 0;
      const loaded = allPages.flatMap((p) => p.data).length;
      return loaded < total ? allPages.length : undefined;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
