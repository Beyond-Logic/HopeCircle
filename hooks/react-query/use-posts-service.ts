import { commentService } from "@/lib/supabase/service/comment-service";
import { postService } from "@/lib/supabase/service/post-service";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export function useGetPosts({
  limit = 10,
  filter = "recent",
  userId,
}: {
  limit?: number;
  filter?: "recent" | "my-groups" | "following" | "popular";
  userId?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["posts", { limit, filter, userId }],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, error, hasMore } = await postService.getPosts(
        pageParam,
        limit,
        filter,
        userId
      );
      if (error) throw error;
      return { posts: data, nextPage: hasMore ? pageParam + 1 : undefined };
    },
    initialPageParam: 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getNextPageParam: (lastPage: { posts: any; nextPage?: number }) =>
      lastPage.nextPage,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
    retry: 1,
  });
}

export function useGetPostById(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      try {
        // First try to fetch as post
        const { data: postData, error: postError } =
          await postService.getPostById(postId);
        if (!postError) return postData;

        // If post not found, try as comment
        const { data: commentData, error: commentError } =
          await commentService.getCommentById(postId);
        if (commentError)
          throw new Error(`Neither post nor comment found with ID: ${postId}`);

        // Fetch post from comment's post_id
        const { data: postFromComment, error: postFromCommentError } =
          await postService.getPostById(commentData.post_id);
        if (postFromCommentError)
          throw new Error(
            `Post not found for comment: ${postFromCommentError.message}`
          );

        return postFromComment;
      } catch (error) {
        throw new Error(
          error && typeof error === "object" && "message" in error
            ? (error.message as string)
            : (error as string) || "Failed to fetch post"
        );
      }
    },
    enabled: !!postId,
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

    onSuccess: (res) => {
      if (res.error) {
        toast.error("Failed to update post. Please try again.");
        return;
      }

      // ✅ Invalidate post-related queries
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      // queryClient.invalidateQueries({ queryKey: ["comments"] });

      toast.success("Post updated successfully!");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error(error);
      toast.error("Failed to update post. Please try again.");
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: (_, postId) => {
      // Invalidate queries so UI updates
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // all posts
      queryClient.invalidateQueries({ queryKey: ["userPosts"] }); // user-specific posts
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] }); // user-specific posts
      queryClient.invalidateQueries({ queryKey: ["post", postId] }); // single post
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      // Invalidate all queries related to comments
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // all posts
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] }); // user-specific posts
      queryClient.invalidateQueries({ queryKey: ["userPosts"] }); // user-specific posts
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["comment", commentId] });
    },
  });
}

export function useDeleteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) => commentService.deleteReply(replyId),
    onSuccess: (_, replyId) => {
      // Invalidate all queries related to comments (and replies live under comments)
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // all posts
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] }); // user-specific posts
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["reply", replyId] });
    },
  });
}

export function useCreatePost({
  //@ts-expect-error - no type
  user,
  //@ts-expect-error - no type
  selectedFiles,
  //@ts-expect-error - no type
  selectedGroupId,
  //@ts-expect-error - no type
  taggedUsers,
  //@ts-expect-error - no type
  reset,
  //@ts-expect-error - no type
  setImagePreviews,
  //@ts-expect-error - no type
  setSelectedFiles,
  //@ts-expect-error - no type
  setSelectedGroupId,
  //@ts-expect-error - no type
  setTaggedUsers,
  //@ts-expect-error - no type
  setShowTagSuggestions,
  //@ts-expect-error - no type
  setTagQuery,
  //@ts-expect-error - no type
  refetch,
  //@ts-expect-error - no type
  onPostCreated,
}) {
  const queryClient = useQueryClient();

  interface CreatePostFormData {
    content: string;
    images?: FileList;
    groupId?: string;
  }

  return useMutation({
    mutationFn: async (data: CreatePostFormData) => {
      const currentUserId = user?.user.id || "";

      // 1. Create post without images (to get postId)
      const { data: createdPost, error: postError } =
        await postService.createPost({
          content: data.content,
          author_id: currentUserId,
          group_id:
            selectedGroupId !== "your-timeline" ? selectedGroupId : undefined,
        });

      if (postError || !createdPost) {
        throw new Error("Error creating post");
      }

      // 2. Upload images
      const uploadedKeys: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileKey = await postService.uploadPostImage(
          selectedFiles[i],
          createdPost.id,
          i
        );
        uploadedKeys.push(fileKey);
      }

      // 3. Update post with uploaded images
      if (uploadedKeys.length > 0) {
        await postService.updatePost(createdPost.id, { images: uploadedKeys });
      }

      // 4. Add tagged users
      if (taggedUsers.length > 0) {
        //@ts-expect-error - no type
        const taggedIds = taggedUsers.map((u) => u.id);
        await postService.addPostTags(createdPost.id, taggedIds);
      }

      // 5. Refetch full post
      const { data: fullPost } = await postService.updatePost(
        createdPost.id,
        {}
      );

      return fullPost || createdPost;
    },
    onSuccess: (newPost) => {
      // ✅ Invalidate posts query so feed refetches
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });

      // Call parent callback
      onPostCreated?.(newPost);

      // Reset form state
      reset();
      setImagePreviews([]);
      setSelectedFiles([]);
      setSelectedGroupId("");
      setTaggedUsers([]);
      setShowTagSuggestions(false);
      setTagQuery("");
      refetch?.();
    },
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });
}

export function usePinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, groupId }: { postId: string; groupId: string }) =>
      postService.pinPost(postId, groupId),

    onSuccess: () => {
      // Invalidate queries so pinned state updates
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      toast.success("Post pinned successfully");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error(error);
      toast.error("Failed to pin post. Please try again.");
    },
  });
}

export function useUnpinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.unpinPost(postId),

    onSuccess: () => {
      // Invalidate queries so unpinned state updates
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["groupPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      toast.success("Post unpinned successfully");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error(error);
      toast.error("Failed to unpin post. Please try again.");
    },
  });
}
