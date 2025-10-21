import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { SignOutButton } from "@/components/auth/sign-out-button";

type AppHeaderProps = {
  session: Session | null;
};

export function AppHeader({ session }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="rounded-lg bg-sky-500/10 px-2 py-1 text-sky-300">
            AutoSync
          </span>
          <span className="hidden text-sm text-slate-400 sm:inline">
            Vehicle Maintenance Companion
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm font-medium text-slate-300">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 transition hover:bg-slate-900"
              >
                Dashboard
              </Link>
              <Link
                href="/mechanics"
                className="rounded-md px-3 py-2 transition hover:bg-slate-900"
              >
                Mechanics
              </Link>
              <Link
                href="/quotes"
                className="rounded-md px-3 py-2 transition hover:bg-slate-900"
              >
                Quotes
              </Link>
              <Link
                href="/vehicles/new"
                className="rounded-md px-3 py-2 transition hover:bg-slate-900"
              >
                Add Vehicle
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 transition hover:bg-slate-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-sky-500 px-3 py-2 text-slate-950 hover:bg-sky-400"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
