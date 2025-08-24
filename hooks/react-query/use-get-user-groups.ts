// hooks/useGroups.ts
import { useQuery } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";

export const useUserGroups = (userId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<any[], Error>({
    queryKey: ["user-groups", userId],
    queryFn: async () => {
      const { data, error } = await groupService.getUserGroups(userId);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000, // 1 min
    refetchOnWindowFocus: false,
  });
};
