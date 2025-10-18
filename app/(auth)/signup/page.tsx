import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { EmailAuthForm } from "@/components/auth/email-auth-form";

export default async function SignupPage() {
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
        <h1 className="text-3xl font-bold text-slate-100">Create your AutoSync account</h1>
        <p className="text-sm text-slate-400">
          We&apos;ll help you capture mileage automatically and never miss a service again.
        </p>
      </div>

      <div className="card p-6">
        <EmailAuthForm mode="signup" />
      </div>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-sky-400 hover:text-sky-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
