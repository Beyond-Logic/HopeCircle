import { postService } from "@/lib/supabase/service/post-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    // placeholderData: (previousData) => previousData, // good for pagination
    refetchOnWindowFocus: false,
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

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: ({ postId, updates }: { postId: string; updates: any }) =>
      postService.updatePost(postId, updates),

    onSuccess: (res, variables) => {
      if (res.error) {
        toast.error("Failed to update post. Please try again.");
        return;
      }

      // ✅ Invalidate post-related queries
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });

      toast.success("Post updated successfully!");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error(error);
      toast.error("Failed to update post. Please try again.");
    },
  });
}
