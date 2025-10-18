"use client";

import { useState } from "react";
import {
  SessionContextProvider,
  type Session
} from "@supabase/auth-helpers-react";
import { createClient } from "@/lib/supabase/client";

type SupabaseProviderProps = {
  session: Session | null;
  children: React.ReactNode;
};

export function SupabaseProvider({ session, children }: SupabaseProviderProps) {
  const [supabaseClient] = useState(() => createClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
      {children}
    </SessionContextProvider>
  );
}
