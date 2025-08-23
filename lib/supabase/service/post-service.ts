import { createClient } from "../client";
import type { CreatePost, UpdatePost } from "@/types/post";

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

  // Get all posts with pagination
  async getPosts(page = 0, limit = 10, groupId?: string) {
    let query = supabase
      .from("posts")
      .select(
        `
        *,
        author:users!author_id(id, first_name, username, last_name, avatar_url, genotype, country),
        group:groups(id, name, type),
        post_likes(user_id),
        comments(count),
        post_tags(tagged_user:users!tagged_user_id(id, first_name, last_name, username))
      `
      )
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;

    return { data, error };
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
  async deletePost(postId: string) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    return { error };
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
};
