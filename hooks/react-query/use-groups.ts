// hooks/useGroups.ts
import { useQuery } from "@tanstack/react-query";
import type { Group } from "@/types/group";
import { groupService } from "@/lib/supabase/service/groups-service";

export const useGroups = (type?: "country" | "theme") => {
  return useQuery<Group[], Error>({
    queryKey: ["groups", type],
    queryFn: async () => {
      const { data, error } = await groupService.getGroups(type);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000, // 1 min
    refetchOnWindowFocus: false,
  });
};
