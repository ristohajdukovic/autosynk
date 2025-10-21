import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";

export const getCachedSession = cache(async () => {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session;
});
