/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/react-query/use-update-group.ts
import { groupService } from "@/lib/supabase/service/groups-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, updates }: { groupId: string; updates: any }) =>
      groupService.updateGroup(groupId, updates),
    onSuccess: (_, { groupId }) => {
      // ✅ refresh group details
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}
