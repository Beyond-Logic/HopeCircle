// hooks/usePostImages.ts
import { useQuery } from "@tanstack/react-query";
import { postService } from "@/lib/supabase/service/post-service";

export function usePostImages(imageKeys?: string[]) {
  return useQuery({
    queryKey: ["post-images", imageKeys],
    queryFn: async () => {
      if (!imageKeys || imageKeys.length === 0) return [];
      const signedUrls = await Promise.all(
        imageKeys.map((key) => postService.getPostImageUrl(key))
      );
      return signedUrls.filter(Boolean) as string[];
    },
    enabled: !!imageKeys && imageKeys.length > 0, // only run when keys exist
    staleTime: 1000 * 60 * 5, // cache for 5 mins
    gcTime: 1000 * 60 * 10, // garbage collect after 10 mins
  });
}
