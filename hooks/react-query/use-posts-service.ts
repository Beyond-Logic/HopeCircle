// hooks/usePostService.ts
import { useQuery } from "@tanstack/react-query";
import { postService } from "@/lib/supabase/service/post-service";

interface UseGetPostsOptions {
  page?: number;
  limit?: number;
  groupId?: string;
}

export function useGetPosts({
  page = 0,
  limit = 10,
  groupId,
}: UseGetPostsOptions = {}) {
  return useQuery({
    queryKey: ["posts", { page, limit, groupId }],
    queryFn: async () => {
      const { data, error } = await postService.getPosts(page, limit, groupId);
      if (error)
        throw new Error(
          error && typeof error === "object" && "message" in error
            ? error.message
            : error || "Failed to fetch posts"
        );
      return data;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 1,
  });
}
