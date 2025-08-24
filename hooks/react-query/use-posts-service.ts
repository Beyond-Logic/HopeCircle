import { postService } from "@/lib/supabase/service/post-service";
import { useQuery } from "@tanstack/react-query";

interface UseGetPostsOptions {
  page?: number;
  limit?: number;
  filter?: "recent" | "my-groups" | "following" | "popular";
  userId?: string;
}

export function useGetPosts({
  page = 0,
  limit = 10,
  filter = "recent",
  userId,
}: UseGetPostsOptions = {}) {
  return useQuery({
    queryKey: ["posts", { page, limit, filter, userId }],
    queryFn: async () => {
      const { data, error } = await postService.getPosts(
        page,
        limit,
        filter,
        userId
      );
      if (error)
        throw new Error(
          error && typeof error === "object" && "message" in error
            ? error.message
            : error || "Failed to fetch posts"
        );
      return data;
    },
    staleTime: 1000 * 60 * 1,
    retry: 1,
  });
}

export function useGetPostById(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await postService.getPostById(postId);
      if (error)
        throw new Error(
          error && typeof error === "object" && "message" in error
            ? error.message
            : error || "Failed to fetch post"
        );
      return data;
    },
    enabled: !!postId, // only run if postId is provided
    staleTime: 1000 * 60 * 1,
    retry: 1,
  });
}
