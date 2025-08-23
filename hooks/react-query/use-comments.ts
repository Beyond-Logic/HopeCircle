import { commentService } from "@/lib/supabase/service/comment-service";
import { useQuery } from "@tanstack/react-query";

// React Query Hook
export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentService.getCommentsByPost(postId),
    enabled: !!postId,
  });
}
