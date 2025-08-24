// --- hooks/useAddComment.ts ---
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const supabase = createClient();

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      authorId,
      content,
      parentCommentId,
    }: {
      postId: string;
      authorId: string;
      content: string;
      parentCommentId?: string;
    }) => {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          author_id: authorId,
          content,
          parent_comment_id: parentCommentId ?? null,
        })
        .select(
          `
          *,
          author:users!author_id(id, username, first_name, last_name, avatar_url)
        `
        )
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // Refresh comments for that post
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
}
