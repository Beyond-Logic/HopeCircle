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
    limit = 21,
    type?: "country" | "theme" | "all",
    search?: string,
    userId?: string
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any[] = [];
      let count = 0;

      // Get groups user is already member of or created
      let userGroupIds: string[] = [];
      if (userId) {
        const { data: userMemberships } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("user_id", userId);

        const { data: userCreatedGroups } = await supabase
          .from("groups")
          .select("id")
          .eq("created_by", userId)
          .eq("status", "active");

        userGroupIds = [
          ...(userMemberships?.map((m) => m.group_id) || []),
          ...(userCreatedGroups?.map((g) => g.id) || []),
        ];
      }

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

      query = query.eq("status", "active");

      // Exclude groups user is already member of or created
      if (userGroupIds.length > 0) {
        query = query.not("id", "in", `(${userGroupIds.join(",")})`);
      }

      // Apply type filter
      if (type === "country" || type === "theme") {
        query = query.eq("type", type);
      }

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // For "all" tab, use simple randomization
      if (type === "all") {
        // Use member_count for ordering to show more active groups first
        query = query
          .order("member_count", { ascending: false }) // Show groups with more members first
          .order("created_at", { ascending: false }); // Then by newest

        const {
          data: groupsData,
          error,
          count: totalCount,
        } = await query.range(page * limit, (page + 1) * limit - 1);

        if (error) throw error;

        // Simple client-side shuffling for variety
        if (page === 0 && groupsData && groupsData.length > 0) {
          const shuffledData = [...groupsData].sort(() => Math.random() - 0.5);
          data = shuffledData;
        } else {
          data = groupsData ?? [];
        }
        count = totalCount ?? 0;
      } else {
        // For country/theme tabs, use normal ordering
        query = query.order("created_at", { ascending: false });

        const {
          data: groupsData,
          error,
          count: groupsCount,
        } = await query.range(page * limit, (page + 1) * limit - 1);

        if (error) throw error;
        data = groupsData ?? [];
        count = groupsCount ?? 0;
      }

      // Add signed images
      const groupsWithImages = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map(async (group: any) => {
          const image_url = group?.image_url
            ? await this.getGroupImageUrl(group?.image_url)
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
          role,
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

    // ✅ Signed creator avatar
    const creatorAvatarUrl = data.creator?.avatar_url
      ? await authService.getAvatarUrl(data.creator.avatar_url)
      : null;

    // ✅ Signed member avatars
    const signedMembers = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data.group_members ?? []).map(async (member: any) => ({
        ...member,
        user: {
          ...member.user,
          avatar_url: member.user?.avatar_url
            ? await authService.getAvatarUrl(member.user.avatar_url)
            : null,
        },
      }))
    );

    // merge in dynamic member_count
    return {
      data: {
        ...data,
        image_url,
        creator: {
          ...data.creator,
          avatar_url: creatorAvatarUrl,
        },
        group_members: signedMembers,
        member_count: data.members_count?.[0]?.count ?? 0,
      },
      error: null,
    };
  },

  // Create group
  async createGroup(group: Omit<CreateGroup, "creator_id">) {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { data: null, error: new Error("Not authenticated") };
    }

    const creatorId = user.data.user.id;

    // Insert group with created_by = auth.uid()
    const { data, error } = await supabase
      .from("groups")
      .insert({
        ...group,
        created_by: creatorId, // ✅ correct column
      })
      .select()
      .single();

    if (error || !data) return { data: null, error };

    // ✅ Automatically join creator
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: data.id,
      user_id: creatorId, // must match auth.uid()
      role: "admin",
    });

    if (memberError) {
      return { data, error: memberError };
    }

    return { data, error: null };
  },

  // groupService.ts
  async updateGroup(
    groupId: string,
    updates: Partial<CreateGroup> & { status?: "active" | "inactive" }
  ) {
    const { data, error } = await supabase
      .from("groups")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
      .select()
      .single();

    if (error) return { data: null, error };
    return { data, error: null };
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
    `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("joined_at", { ascending: false });

    if (!fetchAll) {
      query = query.range(page * limit, (page + 1) * limit - 1);
    }

    const { data, error, count: totalCount } = await query;

    if (error) return { data: null, count: 0, error };

    const groups =
      data?.map((gm) => ({
        ...gm.group,
        //@ts-expect-error - no type
        member_count: gm.group.members[0]?.count ?? 0,
      })) ?? [];

    return {
      data: groups,
      count: totalCount ?? 0,
      hasMore: groups.length === limit, // ✅ Add this line
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
      post_likes(
        user:users!user_id(
          id,
          first_name,
          last_name,
          username,
          avatar_url
        )
      ),
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
      .eq("group_id", groupId)
      .order("is_pinned", { ascending: false }) // Pinned posts first (true comes before false)
      .order("created_at", { ascending: false }) // Then by newest first
      .range(page * limit, (page + 1) * limit - 1);

    const { data, error } = await query;
    if (error) return { data: null, error };

    // ✅ hydrate avatar previews
    const postsWithAvatars = await Promise.all(
      (data ?? []).map(async (post) => {
        // author preview
        let authorAvatar = null;
        if (post.author?.avatar_url) {
          authorAvatar = await authService.getAvatarUrl(post.author.avatar_url);
        }

        // likes previews
        const post_likes = await Promise.all(
          //@ts-expect-error - no type
          (post.post_likes ?? []).map(async (like) => {
            let likeAvatar = null;
            if (like.user?.avatar_url) {
              likeAvatar = await authService.getAvatarUrl(like.user.avatar_url);
            }
            return {
              ...like,
              user: {
                ...like.user,
                avatar_preview: likeAvatar,
              },
            };
          })
        );

        // tagged users previews
        const post_tags = await Promise.all(
          //@ts-expect-error - no type
          (post.post_tags ?? []).map(async (tag) => {
            let tagAvatar = null;
            if (tag.tagged_user?.avatar_url) {
              tagAvatar = await authService.getAvatarUrl(
                tag.tagged_user.avatar_url
              );
            }
            return {
              ...tag,
              tagged_user: {
                ...tag.tagged_user,
                avatar_preview: tagAvatar,
              },
            };
          })
        );

        return {
          ...post,
          author: {
            ...post.author,
            avatar_preview: authorAvatar,
          },
          post_likes,
          post_tags,
        };
      })
    );

    return { data: postsWithAvatars, error: null };
  },

  async deleteGroupImage(groupId: string, fileName: string) {
    // delete from storage
    const { error: storageError } = await supabase.storage
      .from("group-images")
      .remove([fileName]);

    if (storageError) throw storageError;

    // clear the reference in the DB
    const { error: dbError } = await supabase
      .from("groups")
      .update({
        image_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId);

    if (dbError) throw dbError;

    return { success: true };
  },
};
