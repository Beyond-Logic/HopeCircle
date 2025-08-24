// hooks/groups/useGetGroupById.ts
import { useQuery } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";

export function useGetGroupById(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn: async () => {
      const { data, error } = await groupService.getGroup(groupId);
      if (error) throw error;
      return data;
    },
    enabled: !!groupId, // don’t run if groupId is undefined
  });
}
