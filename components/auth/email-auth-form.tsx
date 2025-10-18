"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be under 80 characters")
    .optional()
});

type FormValues = z.infer<typeof schema>;

type AuthMode = "login" | "signup";

type EmailAuthFormProps = {
  mode: AuthMode;
};

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      fullName: ""
    }
  });

  const onSubmit = handleSubmit(async ({ email, password, fullName }) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        toast.success("Check your inbox to confirm your email");
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success("Welcome back");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed";
      setErrorMessage(message);
      toast.error("Authentication error", { description: message });
    } finally {
      setSubmitting(false);
    }
  });

  const handleOAuth = async (provider: "google" | "apple") => {
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Full name
            </label>
            <input
              type="text"
              placeholder="Alex Driver"
              {...register("fullName")}
              autoComplete="name"
              className="w-full"
            />
            {errors.fullName && (
              <p className="text-sm text-danger">{errors.fullName.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            {...register("email")}
            autoComplete="email"
            className="w-full"
          />
          {errors.email && (
            <p className="text-sm text-danger">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Password
          </label>
          <input
            type="password"
            placeholder="********"
            {...register("password")}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            className="w-full"
          />
          {errors.password && (
            <p className="text-sm text-danger">{errors.password.message}</p>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-danger">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
      >
        {isSubmitting
          ? "Just a moment..."
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
          disabled={isSubmitting}
          className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900 disabled:opacity-60"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900 disabled:opacity-60"
        >
          Continue with Apple
        </button>
      </div>
    </form>
  );
}
