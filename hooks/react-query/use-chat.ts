import { chatService } from "@/lib/supabase/service/chat-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useChat(currentUserId: string, otherUserId: string) {
  const queryClient = useQueryClient();
  const roomName = chatService.getRoomName(currentUserId, otherUserId);

  const query = useQuery({
    queryKey: ["chat", roomName],
    queryFn: () => chatService.fetchMessages(currentUserId, otherUserId),
  });

  const mutation = useMutation({
    mutationFn: (content: string) => chatService.sendMessage(currentUserId, otherUserId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", roomName] }),
  });

  return {
    messages: query.data ?? [],
    sendMessage: mutation.mutate,
    isLoading: query.isLoading,
  };
}
