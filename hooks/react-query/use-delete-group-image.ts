// hooks/react-query/use-delete-group-image.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";

export function useDeleteGroupImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      fileName,
    }: {
      groupId: string;
      fileName: string;
    }) => groupService.deleteGroupImage(groupId, fileName),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}
