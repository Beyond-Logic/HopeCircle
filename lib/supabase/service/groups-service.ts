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

  async getGroups(
    page = 0,
    limit = 10,
    type?: "country" | "theme" | "joined",
    search?: string,
    userId?: string
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any[] = [];
      let count = 0;

      // ✅ Joined groups: query via group_members
      if (type === "joined") {
        if (!userId) return { data: [], count: 0, error: null };

        const {
          data: userGroups,
          count: joinedCount,
          error,
        } = await supabase
          .from("group_members")
          .select(
            `
          group:groups(
            *,
            creator:users!created_by(id, first_name, last_name, username, avatar_url),
            group_members!group_members_group_id_fkey(
              user:users!group_members_user_id_fkey(
                id, first_name, last_name, username, avatar_url, genotype, country
              ),
              joined_at
            )
          )
        `,
            { count: "exact" }
          )
          .eq("user_id", userId)
          .order("joined_at", { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data = userGroups?.map((gm: any) => gm.group) ?? [];
        count = joinedCount ?? 0;
      }
      // ✅ Country or theme: query groups table
      else {
        let query = supabase.from("groups").select(
          `
        *,
        creator:users!created_by(id, first_name, last_name, username, avatar_url),
        group_members!group_members_group_id_fkey(
          user:users!group_members_user_id_fkey(
            id, first_name, last_name, username, avatar_url, genotype, country
          ),
          joined_at
        )
      `,
          { count: "exact" }
        );

        if (type === "country" || type === "theme") {
          query = query.eq("type", type);
        }

        if (search) {
          query = query.or(
            `name.ilike.%${search}%,description.ilike.%${search}%`
          );
        }

        query = query
          .order("created_at", { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        const { data: groupsData, error, count: groupsCount } = await query;

        if (error) throw error;

        data = groupsData ?? [];
        count = groupsCount ?? 0;
      }

      // ✅ Add signed images
      const groupsWithImages = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map(async (group: any) => {
          const image_url = group.image_url
            ? await this.getGroupImageUrl(group.image_url)
            : null;
          return { ...group, image_url };
        })
      );

      return { data: groupsWithImages, count, error: null };
    } catch (err) {
      console.error("getGroups error:", err);
      return { data: null, count: 0, error: err };
    }
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
        ),
        members_count:group_members(count)
      `
      )
      .eq("id", groupId)
      .single();

    if (error || !data) return { data: null, error };

    // ✅ Add signed image URL
    const image_url = data.image_url
      ? await this.getGroupImageUrl(data.image_url)
      : null;

    // merge in dynamic member_count
    return {
      data: {
        ...data,
        image_url,
        member_count: data.members_count?.[0]?.count ?? 0, // use aggregate count
      },
      error: null,
    };
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

  // Get user's groups with pagination + total count
  // Get user's groups with pagination OR all

  async getUserGroups(userId: string, page = 0, limit = 10, fetchAll = false) {
    let query = supabase
      .from("group_members")
      .select(
        `
        group:groups(
          *,
          members:group_members(count)
        )
      `
      )
      .eq("user_id", userId)
      .order("joined_at", { ascending: false });

    if (!fetchAll) {
      query = query.range(page * limit, (page + 1) * limit - 1);
    }

    const { data, error } = await query;

    if (error) return { data: null, count: 0, error };

    // Map groups with dynamic member count
    const groups =
      data?.map((gm) => ({
        ...gm.group,
        //@ts-expect-error - no type
        member_count: gm.group.members[0]?.count ?? 0, // Supabase wraps count in array
      })) ?? [];

    return {
      data: groups,
      count: groups.length, // total groups this user is in
      error: null,
    };
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
