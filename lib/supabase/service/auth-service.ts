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

  async checkUsernameAvailability(
    username: string
  ): Promise<{ available: boolean; message?: string }> {
    try {
      // Check if username is in use
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .ilike("username", username)
        .maybeSingle();

      if (userError) {
        console.error("Error checking username:", userError);
        return {
          available: false,
          message: "Error checking username availability",
        };
      }

      // If existingUser is not null, it means a user was found
      if (existingUser) {
        return { available: false, message: "Username is already taken" };
      }

      // Check if username is reserved
      const { data: reservedUsername, error: reservedError } = await supabase
        .from("reserved_usernames")
        .select("username")
        .ilike("username", username)
        .gt("reserved_until", new Date().toISOString())
        .maybeSingle();

      if (reservedError) {
        console.error("Error checking reserved username:", reservedError);
        return {
          available: false,
          message: "Error checking username availability",
        };
      }

      // If reservedUsername is not null, it means the username is reserved
      if (reservedUsername) {
        return {
          available: false,
          message: "Username is temporarily reserved",
        };
      }

      return { available: true };
    } catch (error) {
      console.error("Unexpected error in checkUsernameAvailability:", error);
      return {
        available: false,
        message: "Unexpected error checking username availability",
      };
    }
  },

  async reserveUsername(
    username: string,
    userId: string,
    days: number = 30
  ): Promise<void> {
    try {
      const reservedUntil = new Date();
      reservedUntil.setDate(reservedUntil.getDate() + days);

      const { error } = await supabase.from("reserved_usernames").upsert(
        {
          username: username.toLowerCase(),
          user_id: userId,
          reserved_until: reservedUntil.toISOString(),
        },
        {
          onConflict: "username",
        }
      );

      if (error) {
        console.error("Error reserving username:", error);
        throw new Error(`Failed to reserve username: ${error.message}`);
      }

      console.log(
        `Successfully reserved username: ${username} until ${reservedUntil}`
      );
    } catch (error) {
      console.error("Failed to reserve username:", error);
      throw error;
    }
  },

  async recordUsernameChange(
    userId: string,
    oldUsername: string,
    newUsername: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from("username_history").insert({
        user_id: userId,
        old_username: oldUsername,
        new_username: newUsername,
        changed_by: userId,
      });

      if (error) {
        console.error("Error recording username change:", error);
        throw new Error(`Failed to record username change: ${error.message}`);
      }

      console.log(
        `Successfully recorded username change from ${oldUsername} to ${newUsername}`
      );
    } catch (error) {
      console.error("Failed to record username change:", error);
      throw error;
    }
  },

  async recordNameChange(
    userId: string,
    oldFirstName: string,
    newFirstName: string,
    oldLastName: string,
    newLastName: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from("name_history").insert({
        user_id: userId,
        old_first_name: oldFirstName,
        new_first_name: newFirstName,
        old_last_name: oldLastName,
        new_last_name: newLastName,
        changed_by: userId,
      });

      if (error) {
        console.error("Error recording name change:", error);
        throw new Error(`Failed to record name change: ${error.message}`);
      }

      console.log(`Successfully recorded name change for user ${userId}`);
    } catch (error) {
      console.error("Failed to record name change:", error);
      throw error;
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getNameHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("name_history")
        .select("*")
        .eq("user_id", userId)
        .order("changed_at", { ascending: false });

      if (error) {
        console.error("Error fetching name history:", error);
        throw new Error(`Failed to fetch name history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Failed to fetch name history:", error);
      return [];
    }
  },

  async cleanupExpiredReservations(): Promise<void> {
    await supabase
      .from("reserved_usernames")
      .delete()
      .lt("reserved_until", new Date().toISOString());
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
      show_real_name: profile.show_real_name,
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

  // lib/supabase/service/auth-service.ts
  async upsertUserProfile(profileData: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    genotype: string;
    country: string;
    bio?: string;
    avatar_url?: string;
    role?: string;
    show_real_name?: boolean;
    name_change_count?: number;
    last_name_change?: string;
    username_change_count?: number;
    last_username_change?: string;
  }) {
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          username: profileData.username,
        },
      });

      if (authError) {
        console.error("Auth metadata update failed:", authError);
      }

      // Prepare the update object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateObject: any = {
        id: profileData.id,
        username: profileData.username,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        genotype: profileData.genotype,
        country: profileData.country,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        show_real_name: profileData.show_real_name || true,
        updated_at: new Date().toISOString(),
      };

      // Only include these fields if they're provided
      if (profileData.name_change_count !== undefined) {
        updateObject.name_change_count = profileData.name_change_count;
      }
      if (profileData.last_name_change !== undefined) {
        updateObject.last_name_change = profileData.last_name_change;
      }
      if (profileData.username_change_count !== undefined) {
        updateObject.username_change_count = profileData.username_change_count;
      }
      if (profileData.last_username_change !== undefined) {
        updateObject.last_username_change = profileData.last_username_change;
      }

      // Update the custom users table
      const { data, error } = await supabase
        .from("users")
        .upsert(updateObject, { onConflict: "id" })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
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
