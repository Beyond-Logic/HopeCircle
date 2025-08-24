import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const supabase = createClient();

// --- Like Post ---
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      userId,
    }: {
      postId: string;
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from("post_likes")
        .upsert(
          { post_id: postId, user_id: userId },
          { onConflict: "post_id,user_id", ignoreDuplicates: true }
        )
        .select();

      if (error) throw new Error(error.message);

      const { count, error: countError } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (countError) throw new Error(countError.message);

      return { like: data?.[0] || null, totalLikes: count };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
    },
  });
}

// --- Unlike Post ---
export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      userId,
    }: {
      postId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) throw new Error(error.message);

      const { count, error: countError } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (countError) throw new Error(countError.message);

      return { totalLikes: count };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
    },
  });
}
