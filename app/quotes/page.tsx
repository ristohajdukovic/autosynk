import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { EU } from "@/lib/eu";

export default async function QuotesPage() {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: quoteRequests } = await supabase
    .from("quote_requests")
    .select(
      `
        id,
        vehicle_id,
        task_title,
        details,
        country_code,
        city,
        created_at
      `
    )
    .eq("created_by", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-100">Quote requests</h1>
        <p className="text-sm text-slate-400">
          Track the garages you&apos;ve asked for neutral quotes. We never rank partners based on payments.
        </p>
      </header>

      {quoteRequests && quoteRequests.length > 0 ? (
        <ul className="space-y-4">
          {quoteRequests.map((quote) => (
            <li
              key={quote.id}
              className="card space-y-3 border border-slate-800 bg-slate-900/40 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-100">
                  {quote.task_title}
                </h2>
                <span className="text-xs text-slate-500">
                  {EU.formatDateEU(quote.created_at)}
                </span>
              </div>
              <p className="text-sm text-slate-300">{quote.details}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="badge">{quote.country_code ?? "EU"}</span>
                {quote.city ? <span>{quote.city}</span> : null}
                {quote.vehicle_id ? (
                  <Link
                    href={`/vehicles/${quote.vehicle_id}`}
                    className="rounded-md border border-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-900"
                  >
                    View vehicle
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <section className="card space-y-3 p-8 text-center text-sm text-slate-400">
          <p>You haven&apos;t requested any quotes yet.</p>
          <p>
            Use the <span className="font-semibold text-slate-100">Request quotes</span> action on a maintenance task to start conversations with trusted garages.
          </p>
        </section>
      )}
    </div>
  );
}
