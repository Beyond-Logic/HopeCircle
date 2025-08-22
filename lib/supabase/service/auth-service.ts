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
      profile: profile as UserProfile ?? null,
      error: profileError ?? null,
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
    firstName: string;
    lastName: string;
    genotype: string;
    country: string;
    role?: string;
  }) {
    // Use Supabase's `upsert` which will insert if not exists, update if exists
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: profileData.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          genotype: profileData.genotype,
          country: profileData.country,
          role: profileData.role,
        },
        { onConflict: "id" } // <- ensures uniqueness by id
      )
      .select()
      .single();

    return { data, error };
  },
};
