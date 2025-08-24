// useCreateGroup.ts
import { createClient } from "@/lib/supabase/client";
import { groupService } from "@/lib/supabase/service/groups-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface CreateGroupFormData {
  name: string;
  description: string;
  type: "country" | "theme";
  imageFile?: File | null;
  created_by: string; // ✅ correct column name
}


const supabase = createClient();

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: CreateGroupFormData) => {
      let imageKey: string | null = null;

      // First insert group without image to get ID
      const { data: group, error } = await groupService.createGroup({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        //@ts-expect-error - no type
        created_by: formData.created_by,
      });

      if (error) throw error;
      if (!group?.id) throw new Error("Failed to create group");

      // If image provided → upload & update group
      if (formData.imageFile) {
        imageKey = await groupService.uploadGroupImage(
          formData.imageFile,
          group.id
        );

        const { data: updated, error: updateError } = await supabase
          .from("groups")
          .update({ image_url: imageKey })
          .eq("id", group.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updated;
      }

      return group;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push(`/groups/${data.id}`);
    },
    onError: (err) => {
      console.error("Create group error:", err);
      throw err;
    },
  });
}
