import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupService } from "@/lib/supabase/service/groups-service";

export const useJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      userId,
      isMember,
    }: {
      groupId: string;
      userId: string;
      isMember: boolean;
    }) => {
      if (isMember) {
        // Leave group
        const { error } = await groupService.leaveGroup(groupId, userId);
        if (error) throw error;
      } else {
        // Join group
        const { error } = await groupService.joinGroup(groupId, userId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // ✅ Invalidate queries so UI updates
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({
        queryKey: ["userGroups"],
      });
      queryClient.invalidateQueries({
        queryKey: ["isUserInGroup"],
      });
    },
    onError: (err) => {
      console.error("Join/Leave group error:", err);
    },
  });
};
