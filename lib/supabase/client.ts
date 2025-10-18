import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

export const createClient = () => createBrowserSupabaseClient<Database>();
