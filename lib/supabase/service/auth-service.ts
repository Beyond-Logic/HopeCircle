import { UserProfile } from "@/types/user";
import { createClient } from "../client";
import type { SignUpData, SignInData } from "@/types/auth";

const supabase = createClient();

export const authService = {
  // Sign up new user
  async signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/verify-email`,
      },
    });

    return { data: authData, error };
  },

  // Sign in existing user
  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    return { data: authData, error };
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user including profile
  async getCurrentUser() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return { user: null, profile: null, error: authError };
    }

    if (!user) {
      return { user: null, profile: null, error: null };
    }

    // Try fetch user profile row
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(); // <- use maybeSingle instead of single

    // maybeSingle returns null if no row exists instead of throwing PGRST116
    return {
      user,
      profile: (profile as UserProfile) ?? null,
      error: profileError ?? null,
    };
  },

  async getUserByUsername(username: string) {
    if (!username)
      return { user: null, profile: null, error: "No username provided" };

    const cleanUsername = username.trim();

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .ilike("username", cleanUsername) // case-insensitive
      .maybeSingle();

    if (!profile) {
      return {
        user: null,
        profile: null,
        error: profileError ?? "User not found",
      };
    }

    const user = {
      id: profile.id,
      username: profile.username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
      status: profile.status,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return {
      user: user ?? null,
      profile: profile as UserProfile,
      error: profileError || null,
    };
  },

  // inside authService
  async getUserById(id: string) {
    if (!id) {
      return { user: null, profile: null, error: "No id provided" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id) // exact match on id
      .maybeSingle();

    if (!profile) {
      return {
        user: null,
        profile: null,
        error: profileError ?? "User not found",
      };
    }

    const user = {
      id: profile.id,
      username: profile.username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
      status: profile.status,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return {
      user: user ?? null,
      profile: profile as UserProfile,
      error: profileError || null,
    };
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${window.location.origin}/reset-password`,
    });

    return { data, error };
  },

  // Update password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    return { data, error };
  },

  // Listen to auth changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Create or update user profile
  async upsertUserProfile(profileData: {
    id: string; // the auth user id (foreign key in your users table)
    username: string; // <- new field for username
    first_name: string;
    last_name: string;
    genotype: string;
    country: string;
    bio?: string;
    avatar_url?: string;
    role?: string;
  }) {
    // Use Supabase's `upsert` which will insert if not exists, update if exists
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: profileData.id,
          username: profileData.username, // <- include username in upsert
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          genotype: profileData.genotype,
          country: profileData.country,
          role: profileData.role,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
        },
        { onConflict: "id" } // <- ensures uniqueness by id
      )
      .select()
      .single();

    return { data, error };
  },

  // Upload avatar to Supabase Storage
  async uploadAvatar(file: File, userId: string) {
    if (!file) throw new Error("No file provided");
    if (file.size > 1024 * 1024) throw new Error("File size exceeds 1MB");

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    // Return the object key, NOT the signed URL
    return fileName;
  },

  // Generate a signed URL on demand
  async getAvatarUrl(fileName: string, expiresInSeconds = 3600) {
    if (!fileName) return null;

    const { data, error } = await supabase.storage
      .from("avatars")
      .createSignedUrl(fileName, expiresInSeconds);

    if (error) throw error;
    return data?.signedUrl ?? null;
  },

  // Delete avatar both from Storage and from user profile
  async deleteAvatar(fileName: string, userId?: string) {
    if (!fileName) throw new Error("No file provided to delete");

    // 1️⃣ Delete from Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("avatars")
      .remove([fileName]);

    if (storageError) throw storageError;

    // 2️⃣ Remove avatar_url from user profile if userId provided
    let profileData = null;
    let profileError = null;
    if (userId) {
      const { data, error } = await supabase
        .from("users")
        .update({ avatar_url: null })
        .eq("id", userId)
        .select()
        .single();

      profileData = data;
      profileError = error;

      if (profileError) throw profileError;
    }

    return { storageData, profileData, error: storageError || profileError };
  },
};
