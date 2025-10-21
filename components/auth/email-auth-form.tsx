"use client";

import { useState, useTransition } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type AuthMode = "login" | "signup";

type EmailAuthFormProps = {
  mode: AuthMode;
};

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage("Email and password are required");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "signup") {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || null
              },
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });
          if (error) throw error;
          toast.success("Check your inbox to confirm your email");
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          toast.success("Welcome back");
        }

        router.replace("/dashboard");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Authentication failed";
        setErrorMessage(message);
        toast.error("Authentication error", { description: message });
      }
    });
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    startTransition(async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to start OAuth flow";
        toast.error("OAuth error", { description: message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Full name
            </label>
            <input
              type="text"
              placeholder="Alex Driver"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              className="w-full"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Password
          </label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            className="w-full"
            required
          />
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-danger">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={isPending || !email || !password}
        className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
      >
        {isPending
          ? mode === "signup"
            ? "Creating account..."
            : "Signing in..."
          : mode === "signup"
            ? "Create account"
            : "Log in"}
      </button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
        <span className="h-px flex-1 bg-slate-800" />
        OR
        <span className="h-px flex-1 bg-slate-800" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={isPending}
          className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900 disabled:opacity-60"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={isPending}
          className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900 disabled:opacity-60"
        >
          Continue with Apple
        </button>
      </div>
    </form>
  );
}
