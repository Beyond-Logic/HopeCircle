/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/react-query/use-update-group.ts
import { createClient } from "@/lib/supabase/client";
import { groupService } from "@/lib/supabase/service/groups-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateGroupFormData {
  name?: string;
  description?: string;
  type?: "country" | "theme";
  imageFile?: File | null;
  status?: "active" | "inactive"; // in case you archive/restore
}

const supabase = createClient();

export function useUpdateGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      updates,
    }: {
      groupId: string;
      updates: UpdateGroupFormData;
    }) => {
      let imageKey: string | null = null;

      // ✅ update group base info first
      const { data: updatedGroup, error } = await groupService.updateGroup(
        groupId,
        {
          name: updates.name,
          description: updates.description,
          type: updates.type,
          status: updates.status,
        }
      );

      if (error) throw error;
      if (!updatedGroup) throw new Error("Failed to update group");

      // ✅ handle image upload
      if (updates.imageFile) {
        imageKey = await groupService.uploadGroupImage(
          updates.imageFile,
          groupId
        );

        const { data: imageUpdated, error: imageError } = await supabase
          .from("groups")
          .update({ image_url: imageKey })
          .eq("id", groupId)
          .select()
          .single();

        if (imageError) throw imageError;
        return imageUpdated;
      }

      return updatedGroup;
    },

    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },

    onError: (err) => {
      console.error("Update group error:", err);
      throw err;
    },
  });
}
