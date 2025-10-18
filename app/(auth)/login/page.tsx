import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { EmailAuthForm } from "@/components/auth/email-auth-form";

export default async function LoginPage() {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 pt-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-slate-100">Welcome back</h1>
        <p className="text-sm text-slate-400">
          Log in to view your vehicles, odometer updates, and reminders.
        </p>
      </div>

      <div className="card p-6">
        <EmailAuthForm mode="login" />
      </div>

      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-sky-400 hover:text-sky-300">
          Create one
        </Link>
      </p>
    </div>
  );
}
