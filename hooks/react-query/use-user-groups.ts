// hooks/useUserGroups.ts
import { useInfiniteQuery  } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";
import { Group } from "@/types/group";

export const useUserGroups = (userId: string, limit = 10, fetchAll = false) => {
  return useInfiniteQuery({
    queryKey: ["userGroups", userId, limit],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, count, error } = await groupService.getUserGroups(
        userId,
        pageParam,
        limit,
        fetchAll,
      );
      if (error) throw error;

      return { data: (data || []) as unknown as Group[], count: count || 0, page: pageParam };
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: { data: Group[]; count: number; page: number },
      allPages: { data: Group[]; count: number; page: number }[]
    ) => {
      const total = lastPage.count ?? 0;
      const loaded = allPages.flatMap((p) => p.data).length;
      return loaded < total ? allPages.length : undefined; // next page index
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
