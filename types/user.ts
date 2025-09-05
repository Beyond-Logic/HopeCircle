import { User } from "@supabase/supabase-js";

// User profile (your custom table)
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  genotype: string;
  country: string;
  avatar_url: string | null;
  bio: string | null;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
  show_real_name: boolean;
  name_change_count: number;
  last_name_change: string;
  username_change_count: number;
  last_username_change: string
}

// Example combined return from getCurrentUser
export interface CurrentUserResponse {
  user: User | null;
  profile: UserProfile | null;
  error: unknown | null;
}
