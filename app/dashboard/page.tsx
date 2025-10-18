import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { VehicleCard } from "@/components/dashboard/vehicle-card";
import { ReminderList } from "@/components/dashboard/reminder-list";
import { MaintenanceTimeline } from "@/components/dashboard/maintenance-timeline";
import { QuickCapturePanel } from "@/components/dashboard/quick-capture-panel";
import type { MaintenanceStatus } from "@/types/database";

type TimelineEvent = {
  id: string;
  label: string;
  type: "service" | "maintenance" | "odometer";
  occurred_at: string;
  mileage: number | null;
  status: MaintenanceStatus | null;
  vehicle_id?: string;
};

export default async function DashboardPage() {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select(
      `
      id,
      nickname,
      make,
      model,
      year,
      photo_url,
      base_mileage,
      maintenance_tasks (
        id,
        title,
        status,
        next_due_date,
        next_due_mileage
      ),
      odometer_entries (
        id,
        mileage,
        recorded_at
      ),
      service_records (
        id,
        title,
        service_date,
        mileage
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const { data: tasks } = await supabase
    .from("maintenance_tasks")
    .select("*")
    .eq("created_by", session.user.id)
    .order("next_due_date", { ascending: true })
    .limit(10);

  const timelineEvents: TimelineEvent[] = [];

  if (vehicles?.length) {
    await Promise.all(
      vehicles.map(async (vehicle) => {
        const { data } = await supabase.rpc("get_timeline_events", {
          p_vehicle_id: vehicle.id
        });
        data?.forEach((event) =>
          timelineEvents.push({ ...event, vehicle_id: vehicle.id })
        );
      })
    );
  }

  const hasVehicles = vehicles && vehicles.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400">
            View vehicle health at a glance and keep maintenance on schedule.
          </p>
        </div>
        {hasVehicles && (
          <Link
            href="/vehicles/new"
            className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            + Add another vehicle
          </Link>
        )}
      </header>

      {!hasVehicles ? (
        <div className="card flex flex-col items-center gap-6 p-10 text-center">
          <div className="rounded-full bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
            Let&apos;s get started
          </div>
          <h2 className="text-2xl font-semibold text-slate-100">
            Add your first vehicle
          </h2>
          <p className="max-w-md text-sm text-slate-400">
            Capture basic details, log the current mileage, and we&apos;ll
            generate a maintenance plan with smart reminders from there.
          </p>
          <Link
            href="/vehicles/new"
            className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Add a vehicle
          </Link>
        </div>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-200">
                Your garage
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {vehicles?.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </div>
            <ReminderList tasks={tasks ?? []} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
            <MaintenanceTimeline events={timelineEvents} vehicles={vehicles ?? []} />
            <QuickCapturePanel userId={session.user.id} vehicles={vehicles ?? []} />
          </section>
        </>
      )}
    </div>
  );
}
