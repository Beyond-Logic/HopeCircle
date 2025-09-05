// hooks/useUpsertUserProfile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/supabase/service/auth-service";

interface UpsertUserProfileData {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  genotype: string;
  country: string;
  bio?: string;
  avatar_url?: string;
  role?: string;
  show_real_name: boolean;
  name_change_count?: number;
  last_name_change?: string;
  username_change_count?: number;
  last_username_change?: string;
}

export function useUpsertUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: UpsertUserProfileData) => {
      const { data, error } = await authService.upsertUserProfile(profileData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // ✅ Invalidate posts & comments so avatars refresh instantly
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
