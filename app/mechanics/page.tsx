import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function MechanicsPage() {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: mechanics } = await supabase
    .from("mechanic_locations")
    .select("*")
    .order("rating", { ascending: false })
    .limit(12);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-100">Mechanic finder</h1>
        <p className="text-sm text-slate-400">
          Discover nearby service centers and independent garages with quality
          ratings.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="card overflow-hidden">
          <iframe
            title="Nearby mechanics"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-122.52%2C37.68%2C-122.33%2C37.83&amp;layer=mapnik"
            className="h-[420px] w-full border-0"
            loading="lazy"
          />
        </div>
        <div className="card space-y-3 p-6">
          <h2 className="text-lg font-semibold text-slate-100">
            How it works
          </h2>
          <ul className="list-disc space-y-2 pl-6 text-sm text-slate-400">
            <li>We display curated garages near your default location.</li>
            <li>
              Use the contact card to call ahead or jump into map directions.
            </li>
            <li>
              Save the shop name in your service record notes for quick recall.
            </li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {(mechanics ?? []).map((mechanic) => (
          <article
            key={mechanic.id}
            className="card flex flex-col gap-3 p-6"
          >
            <header className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">
                  {mechanic.name}
                </h3>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {mechanic.address}
                </p>
              </div>
              {mechanic.rating ? (
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
                  {mechanic.rating.toFixed(1)} *
                </span>
              ) : null}
            </header>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              {mechanic.phone ? (
                <Link
                  href={`tel:${mechanic.phone}`}
                  className="rounded-md border border-slate-800 px-3 py-1 transition hover:bg-slate-900"
                >
                  Call
                </Link>
              ) : null}
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mechanic.address)}`}
                className="rounded-md border border-slate-800 px-3 py-1 transition hover:bg-slate-900"
              >
                Directions
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}


