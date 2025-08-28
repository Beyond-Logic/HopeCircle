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
      const res = await authService.getCurrentUser();
      if (!res.profile)
        throw new Error(
          res.error && typeof res.error === "object" && "message" in res.error
            ? res.error.message
            : res.error || "User not found"
        );
      return res;
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
