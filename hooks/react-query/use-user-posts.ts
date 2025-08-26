// hooks/useUserPosts.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { postService } from "@/lib/supabase/service/post-service";
import type { Post } from "@/types/post";

export const useUserPosts = (userId: string, limit = 10) => {
  return useInfiniteQuery({
    queryKey: ["userPosts", userId, limit],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, count, error } = await postService.getUserPosts(
        userId,
        pageParam,
        limit
      );
      if (error) throw error;

      return { data: data || [], count: count || 0, page: pageParam };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: { data: Post[]; count: number; page: number }, allPages: { data: Post[]; count: number; page: number }[]) => {
      const total = lastPage.count ?? 0;
      const loaded = allPages.flatMap((p) => p.data).length;
      return loaded < total ? allPages.length : undefined; // next page index
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
