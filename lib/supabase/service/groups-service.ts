import { createClient } from "../client";
import type { CreateGroup } from "@/types/group";
import { authService } from "./auth-service";

const supabase = createClient();

export const groupService = {
  // Upload group image
  async uploadGroupImage(file: File, groupId: string) {
    if (!file) throw new Error("No file provided");
    if (file.size > 1024 * 1024) throw new Error("File size exceeds 1MB");

    const fileExt = file.name.split(".").pop();
    const fileName = `group-${groupId}.${fileExt}`;

    const { error } = await supabase.storage
      .from("group-images")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;
    return fileName; // store key in DB
  },

  async getGroupImageUrl(fileName: string, expiresInSeconds = 3600) {
    if (!fileName) return null;

    const { data, error } = await supabase.storage
      .from("group-images")
      .createSignedUrl(fileName, expiresInSeconds);

    if (error) throw error;
    return data?.signedUrl ?? null;
  },

  // Get all groups
  async getGroups(type?: "country" | "theme") {
    let query = supabase
      .from("groups")
      .select(
        `
      *,
      creator:users!created_by(id, first_name, last_name, username, avatar_url),
      group_members!group_members_group_id_fkey(
        user:users!group_members_user_id_fkey(
          id, first_name, last_name, username, avatar_url, genotype, country
        ),
        joined_at
      )
    `
      )
      .order("created_at", { ascending: false });

    if (type) query = query.eq("type", type);

    const { data, error } = await query;
    if (error) return { data: null, error };

    // ✅ Convert storage key to signed URL
    const groupsWithImages = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data ?? []).map(async (group: any) => {
        const image_url = group.image_url
          ? await this.getGroupImageUrl(group.image_url)
          : null;
        return { ...group, image_url };
      })
    );

    return { data: groupsWithImages, error: null };
  },

  // Get single group
  async getGroup(groupId: string) {
    const { data, error } = await supabase
      .from("groups")
      .select(
        `
    *,
    creator:users!created_by(id, first_name, last_name, username, avatar_url),
    group_members(
      user:users!group_members_user_id_fkey(
        id, first_name, last_name, avatar_url, username, genotype, country
      ),
      joined_at
    )
    `
      )
      .eq("id", groupId)
      .single();

    if (error || !data) return { data: null, error };

    // ✅ Add signed image URL
    const image_url = data.image_url
      ? await this.getGroupImageUrl(data.image_url)
      : null;

    return { data: { ...data, image_url }, error: null };
  },
  // Create group
  async createGroup(group: CreateGroup) {
    const { data, error } = await supabase
      .from("groups")
      .insert(group)
      .select()
      .single();

    return { data, error };
  },

  // Join group
  async joinGroup(groupId: string, userId: string) {
    const { data, error } = await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: userId,
    });

    return { data, error };
  },

  // Leave group
  async leaveGroup(groupId: string, userId: string) {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    return { error };
  },

  // Get user's groups
  async getUserGroups(userId: string) {
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `
        group:groups(*)
      `
      )
      .eq("user_id", userId);

    return { data, error };
  },

  // Check if user belongs to a group
  async isUserInGroup(groupId: string, userId: string) {
    const { count, error } = await supabase
      .from("group_members")
      .select("id", { count: "exact", head: true }) // only count, no rows returned
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      return false;
    }

    // If count > 0, user belongs to the group
    return (count ?? 0) > 0;
  },

  // Get posts for a specific group
  async getGroupPosts(groupId: string, page = 0, limit = 10) {
    const query = supabase
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
        post_likes(user_id),
        comments(count),
        post_tags(tagged_user:users!tagged_user_id(id, first_name, last_name, username))
      `
      )
      .eq("group_id", groupId)
      .order("created_at", { ascending: false }) // latest first
      .range(page * limit, (page + 1) * limit - 1);

    const { data, error } = await query;

    if (error) return { data: null, error };

    // Add avatar previews for each post author
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

    return { data: postsWithAvatars, error: null };
  },
};
