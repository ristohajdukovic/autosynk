import Link from "next/link";
import { AppRoutes } from "@/lib/constants";
import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/supabase/session";
import { AppRoutes } from "@/lib/constants";

export default async function LandingPage() {
  const session = await getCachedSession();

  if (session) {
    redirect(AppRoutes.DASHBOARD);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 pt-10">
      <section className="text-center">
        <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
          MVP Preview
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-100 sm:text-5xl">
          Keep every vehicle<span className="text-sky-400"> maintenance-ready</span>.
        </h1>
        <p className="mt-6 text-lg text-slate-400">
          AutoSync centralizes mileage tracking, smart reminders, and a digital
          service logbook so you always know what&apos;s next and what&apos;s been done.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href={AppRoutes.SIGNUP}
            className="rounded-lg bg-sky-500 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Create account
          </Link>
          <Link
            href={AppRoutes.LOGIN}
            className="rounded-lg border border-slate-800 px-5 py-3 text-base font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {landingHighlights.map((item) => (
          <div key={item.id} className="card p-6">
            <div className="text-sm font-semibold uppercase tracking-wide text-sky-300">
              {item.title}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

const landingHighlights = [
  {
    id: "roadmap",
    title: "Smart maintenance roadmap",
    description:
      "Recommended service intervals and reminders tailored to your vehicle, with quick updates for anything you add manually."
  },
  {
    id: "uploads",
    title: "Mileage photo uploads",
    description:
      "Upload odometer photos and capture mileage in seconds. Edit values anytime if the OCR confidence is low."
  },
  {
    id: "logbook",
    title: "Shareable digital logbook",
    description:
      "Centralize service receipts, costs, and notes in a printable timeline you can export as a PDF for buyers or mechanics."
  },
  {
    id: "mechanics",
    title: "Garage discovery",
    description:
      "Explore nearby recommended mechanics with contact info, ratings, and quick links to map directions."
  }
];
