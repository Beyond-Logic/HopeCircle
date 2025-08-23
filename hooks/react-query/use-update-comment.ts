// hooks/useUpdateComment.ts
import { commentService } from "@/lib/supabase/service/comment-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentService.updateComment(id, content),
    onSuccess: () => {
      // ✅ Optimistically update cache so UI reflects immediately
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}
