import { createClient } from "../client";
import type { CreatePost, UpdatePost } from "@/types/post";
import { authService } from "./auth-service";

const supabase = createClient();

export const postService = {
  // Upload a single post image
  async uploadPostImage(file: File, postId: string, index: number) {
    if (!file) throw new Error("No file provided");
    if (file.size > 1024 * 1024) throw new Error("Image must be under 1MB");

    const fileExt = file.name.split(".").pop();
    const fileName = `${postId}/${Date.now()}_${index}.${fileExt}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    return fileName; // store key in DB
  },

  // Generate signed URL for displaying
  async getPostImageUrl(fileName: string, expiresInSeconds = 3600) {
    if (!fileName) return null;

    const { data, error } = await supabase.storage
      .from("post-images")
      .createSignedUrl(fileName, expiresInSeconds);

    if (error) throw error;
    return data?.signedUrl ?? null;
  },

  // Get single post by ID
  async getPostById(postId: string) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
      *,
      author:users!author_id(
        id,
        first_name,
        username,
        last_name,
        avatar_url,
        genotype,
        country
      ),
      group:groups(id, name, type),
      post_likes(user_id),
      comments(count),
      post_tags(
        tagged_user:users!tagged_user_id(
          id,
          first_name,
          last_name,
          username,
          avatar_url
        )
      )
    `
      )
      .eq("id", postId)
      .single();

    if (error) return { data: null, error };

    // ✅ Add avatar preview for author
    let avatar_preview = null;
    if (data?.author?.avatar_url) {
      avatar_preview = await authService.getAvatarUrl(data.author.avatar_url);
    }

    // ✅ Add avatar previews for tagged users
    const postTagsWithAvatars = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data?.post_tags ?? []).map(async (tag: any) => {
        let tag_avatar_preview = null;
        if (tag?.tagged_user?.avatar_url) {
          tag_avatar_preview = await authService.getAvatarUrl(
            tag.tagged_user.avatar_url
          );
        }
        return {
          ...tag,
          tagged_user: {
            ...tag.tagged_user,
            avatar_preview: tag_avatar_preview,
          },
        };
      })
    );

    return {
      data: {
        ...data,
        author: {
          ...data.author,
          avatar_preview,
        },
        post_tags: postTagsWithAvatars,
      },
      error: null,
    };
  },
  // Get all posts with pagination
  // Get all posts with pagination and filtering

  async getPosts(
    page = 0,
    limit = 10,
    filter: "recent" | "my-groups" | "following" | "popular" = "recent",
    userId?: string
  ) {
    let query = supabase.from("posts").select(
      `
    *,
    author:users!author_id(id, first_name, username, last_name, avatar_url, genotype, country),
    group:groups(id, name, type),
    post_likes(user_id),
    comments(count),
    post_tags(tagged_user:users!tagged_user_id(id, first_name, last_name, username))
  `
    );

    // ✅ filtering logic (unchanged)
    if (filter === "my-groups" && userId) {
      const { data: groupMembers, error: groupError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);
      if (groupError) throw groupError;
      const groupIds = groupMembers?.map((gm) => gm.group_id) ?? [];
      query = query.in("group_id", groupIds);
    }

    if (filter === "following" && userId) {
      const { data: followingRows, error: followingError } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", userId);
      if (followingError) throw followingError;
      const followingIds = followingRows?.map((row) => row.following_id) ?? [];
      query = query.in("author_id", followingIds);
    }

    if (filter === "popular") {
      query = query.order("likes_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // ✅ pagination
    query = query.range(page * limit, (page + 1) * limit - 1);

    const { data, error } = await query;
    if (error) return { data: [], error, hasMore: false };

    // ✅ avatar previews
    const postsWithAvatars = await Promise.all(
      (data ?? []).map(async (post) => {
        let avatar_preview = null;
        if (post.author?.avatar_url) {
          avatar_preview = await authService.getAvatarUrl(
            post.author.avatar_url
          );
        }
        return {
          ...post,
          author: {
            ...post.author,
            avatar_preview,
          },
        };
      })
    );

    // ✅ if we got `limit` items, assume there might be more
    return {
      data: postsWithAvatars,
      error: null,
      hasMore: (data?.length ?? 0) === limit,
    };
  },
  // Create new post
  async createPost(post: CreatePost) {
    const { data, error } = await supabase
      .from("posts")
      .insert(post)
      .select(
        `
        *,
        author:users!author_id(id, first_name, last_name, avatar_url, genotype, country),
        group:groups(id, name, type)
      `
      )
      .single();

    return { data, error };
  },

  // Update post
  async updatePost(postId: string, updates: UpdatePost) {
    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", postId)
      .select(
        `
      *,
      author:users!author_id(id, first_name, last_name, avatar_url, genotype, country),
      group:groups(id, name, type),
      post_likes(user_id),
      post_tags(tagged_user:users!tagged_user_id(id, first_name, last_name))
    `
      )
      .single();

    return { data, error };
  },

  // Delete post
  // Delete post and associated images from storage
  async deletePost(postId: string) {
    // 1. Get the post with its images
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("images")
      .eq("id", postId)
      .single();

    if (fetchError) return { error: fetchError };

    // 2. Delete the post (this cascades deletes to comments, likes, tags, etc.)
    const { error: postError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (postError) return { error: postError };

    // 3. Delete images from storage if any exist
    if (post?.images && post.images.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("post-images") //
        .remove(post.images);

      if (storageError) return { error: storageError };
    }

    return { error: null };
  },
  // Like/unlike post

  async likePost(postId: string, userId: string) {
    // Insert like safely, ignore if already exists
    const { data, error } = await supabase
      .from("post_likes")
      .upsert(
        { post_id: postId, user_id: userId },
        { onConflict: "post_id,user_id", ignoreDuplicates: true }
      )
      .select();

    if (error) return { data: null, error };

    // Get updated total likes count
    const { count, error: countError } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (countError) return { data: null, error: countError };

    return {
      data: { like: data?.[0] || null, totalLikes: count },
      error: null,
    };
  },

  async unlikePost(postId: string, userId: string) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) return { data: null, error };

    // Get updated total likes count
    const { count, error: countError } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (countError) return { data: null, error: countError };

    return { data: { totalLikes: count }, error: null };
  },

  // Add post tags
  async addPostTags(postId: string, taggedUserIds: string[]) {
    const tags = taggedUserIds.map((userId) => ({
      post_id: postId,
      tagged_user_id: userId,
    }));

    const { data, error } = await supabase.from("post_tags").insert(tags);

    return { data, error };
  },

  // 🚨 Report a post
  async reportPost(
    postId: string,
    reportedBy: string,
    reason:
      | "spam"
      | "harassment"
      | "inappropriate_content"
      | "misinformation"
      | "other",
    description?: string
  ) {
    const { data, error } = await supabase
      .from("post_reports")
      .insert({
        post_id: postId,
        reported_by: reportedBy,
        reason,
        description: description ?? null,
      })
      .select()
      .single();

    return { data, error };
  },

  // Get reports created by current user
  async getUserReports(userId: string) {
    const { data, error } = await supabase
      .from("post_reports")
      .select(
        `
        *,
        post:posts(id, content, images, author:users(id, username))
      `
      )
      .eq("reported_by", userId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // (optional) Admin fetch all reports
  async getAllReports() {
    const { data, error } = await supabase
      .from("post_reports")
      .select(
        `
        *,
        post:posts(id, content, images, author:users(id, username)),
        reporter:users!reported_by(id, username, avatar_url)
      `
      )
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Update report status for a post (admin/moderator only)
  async updatePostReportStatus(
    reportId: string,
    status: string,
    reviewedBy: string
  ) {
    const { data, error } = await supabase
      .from("post_reports")
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId)
      .select()
      .single();

    return { data, error };
  },

  // Get all posts by a specific user (with total count in one query)
  async getUserPosts(userId: string, page = 0, limit = 10) {
    const { data, error, count } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:users!author_id(
          id,
          first_name,
          username,
          last_name,
          avatar_url,
          genotype,
          country
        ),
        group:groups(id, name, type),
        post_likes(user_id),
        comments(count),
        post_tags(
          tagged_user:users!tagged_user_id(id, first_name, last_name, username)
        )
      `,
        { count: "exact" } // ✅ also return total count
      )
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) return { data: null, count: 0, error };

    // ✅ Add avatar previews
    const postsWithAvatars = await Promise.all(
      (data ?? []).map(async (post) => {
        let avatar_preview = null;
        if (post.author?.avatar_url) {
          try {
            avatar_preview = await authService.getAvatarUrl(
              post.author.avatar_url
            );
          } catch {
            avatar_preview = null;
          }
        }
        return {
          ...post,
          author: {
            ...post.author,
            avatar_preview,
          },
        };
      })
    );

    return { data: postsWithAvatars, count: count ?? 0, error: null };
  },
};
