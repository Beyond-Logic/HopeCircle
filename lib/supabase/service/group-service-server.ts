import { createClient as createServerClient } from "@/lib/supabase/server";

export async function getGroupMinimal(groupId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, description, image_url")
    .eq("id", groupId)
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getPostByIdMinimal(postId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      group:groups(id, name, type)
    `
    )
    .eq("id", postId)
    .single();

  if (error) return { data: null, error };

  return {
    data,
    error: null,
  };
}
