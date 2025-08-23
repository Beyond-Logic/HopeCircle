import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const supabase = createClient();

// --- Like Comment ---
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      userId,
    }: {
      commentId: string;
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from("comment_likes")
        .upsert(
          { comment_id: commentId, user_id: userId },
          { onConflict: "comment_id,user_id", ignoreDuplicates: true }
        )
        .select();

      if (error) throw new Error(error.message);

      const { count, error: countError } = await supabase
        .from("comment_likes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId);

      if (countError) throw new Error(countError.message);

      return { like: data?.[0] || null, totalLikes: count };
    },
    onSuccess: () => {
      // invalidate queries where comments are fetched
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

// --- Unlike Comment ---
export function useUnlikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      userId,
    }: {
      commentId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", userId);

      if (error) throw new Error(error.message);

      const { count, error: countError } = await supabase
        .from("comment_likes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId);

      if (countError) throw new Error(countError.message);

      return { totalLikes: count };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}
