// hooks/useAuthService.ts
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/lib/supabase/service/auth-service";

// ---------------------
// QUERIES
// ---------------------

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      if (!user.profile)
        throw new Error(
          user.error && typeof user.error === "object" && "message" in user.error
            ? user.error.message
            : user.error || "User not found"
        );
      console.log("user", user)  
      return user;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// export function useProfileByUsername(username: string) {
//   return useQuery({
//     queryKey: ["profile", username],
//     queryFn: async () => {
//       const res = await authService.getUserByUsername(username);
//       if (!res.profile)
//         throw new Error(
//           typeof res.error === "object" && "message" in res.error
//             ? res.error.message
//             : res.error || "User not found"
//         );
//       return res;
//     },
//     enabled: !!username,
//     staleTime: 1000 * 60 * 5,
//     retry: 1,
//   });
// }

export function useProfileByUsername(usernameOrId?: string) {
  return useQuery({
    queryKey: ["profile", usernameOrId],
    queryFn: async () => {
      if (!usernameOrId) throw new Error("No username or id provided");

      // Try by username first
      const byUsername = await authService.getUserByUsername(usernameOrId);
      if (byUsername?.profile) return byUsername;

      // Then try by id
      const byId = await authService.getUserById(usernameOrId);
      if (byId?.profile) return byId;

      throw new Error("User not found");
    },
    enabled: !!usernameOrId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
