// hooks/useGroups.ts
import { useQuery } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";

export const useGroups = (page = 0, limit = 10, type?: "country" | "theme") => {
  return useQuery({
    queryKey: ["groups", type, page, limit],
    queryFn: async () => {
      const { data, error } = await groupService.getGroups(page, limit, type);
      if (error)
        throw new Error(
          error && typeof error === "object" && "message" in error
            ? error.message
            : error || "Failed to fetch post"
        );
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1,
    retry: 1,
  });
};
