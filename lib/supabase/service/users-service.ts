import { createClient } from "../client";

const supabase = createClient();

export const userService = {
  // Search  user followers for tagging for tagging
  async searchUsers(query: string, limit = 10) {
    const { data, error } = await supabase
      .from("user_follows")
      .select("id")
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(limit);

    return { data, error };
  },

  // Follow/unfollow user
  async followUser(followerId?: string, followingId?: string) {
    const { data, error } = await supabase.from("user_follows").insert({
      follower_id: followerId,
      following_id: followingId,
    });

    return { data, error };
  },

  async unfollowUser(followerId: string, followingId: string) {
    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    return { error };
  },

  // Get user's followers/following
  async getUserFollowers(userId: string) {
    const { data: follows, error } = await supabase
      .from("user_follows")
      .select("follower_id")
      .eq("following_id", userId);

    if (error) return { data: null, error };

    if (!follows?.length) return { data: [], error: null };

    const followerIds = follows.map((f) => f.follower_id);

    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, username, avatar_url, country, genotype")
      .in("id", followerIds);

    return { data: users, error: userError };
  },

  async getUserFollowing(userId: string) {
    // Step 1: get following user IDs
    const { data: follows, error: followsError } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (followsError) return { data: null, error: followsError };
    if (!follows?.length) return { data: [], error: null };

    const followingIds = follows.map((f) => f.following_id);

    // Step 2: fetch actual users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(
        "id, first_name, last_name, username, avatar_url, country, genotype"
      )
      .in("id", followingIds);

    return { data: users, error: usersError };
  },
};
