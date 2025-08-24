// hooks/useIsUserInGroup.ts
import { useQuery } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";

export const useIsUserInGroup = (groupId: string, userId: string) => {
  return useQuery<boolean, Error>({
    queryKey: ["isUserInGroup", groupId, userId],
    queryFn: async () => {
      const result = await groupService.isUserInGroup(groupId, userId);
      return result; // true or false
    },
    enabled: !!groupId && !!userId, // only run if both IDs are provided
    staleTime: 60 * 1000, // 1 min cache
    refetchOnWindowFocus: false,
  });
};
