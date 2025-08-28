// lib/supabase/server-client.ts
import { createClient } from "@supabase/supabase-js";

export const createServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // Note: not the public anon key
  );
};
