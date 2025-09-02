// hooks/useUserGroups.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";
import { Group } from "@/types/group";

export const useUserGroups = (userId: string, limit = 10, fetchAll = false) => {
  return useInfiniteQuery({
    queryKey: ["userGroups", userId, limit],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const response = await groupService.getUserGroups(
        userId,
        pageParam,
        limit,
        fetchAll
      );

      console.log("Page", pageParam, "response:", {
        dataLength: response.data?.length,
        hasMore: response.hasMore,
        count: response.count,
      });

      if (response.error) throw response.error;

      return {
        data: (response.data || []) as unknown as Group[],
        count: response.count || 0,
        hasMore: response.hasMore || false,
        page: pageParam,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (
      lastPage: {
        data: Group[];
        count: number;
        hasMore: boolean;
        page: number;
      },
      allPages: {
        data: Group[];
        count: number;
        hasMore: boolean;
        page: number;
      }[]
    ) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
