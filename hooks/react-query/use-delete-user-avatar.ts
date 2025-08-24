import { authService } from "@/lib/supabase/service/auth-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileName, userId }: { fileName: string; userId: string }) =>
      authService.deleteAvatar(fileName, userId),
    onSuccess: () => {
      // Invalidate queries to refresh UI everywhere avatar is used
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });

      toast.success("Avatar deleted successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error?.message || "Failed to delete avatar");
    },
  });
}
