"use client";

import { useTransition } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SignOutButton() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () =>
    startTransition(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Unable to sign out", { description: error.message });
        return;
      }
      toast.success("Signed out");
      router.replace("/");
      router.refresh();
    });

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="rounded-md border border-slate-800 px-3 py-2 text-slate-300 transition hover:bg-slate-900 disabled:opacity-60"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
