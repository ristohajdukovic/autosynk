import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { QuickCapturePanel } from "@/components/dashboard/quick-capture-panel";
import { MaintenanceTimeline } from "@/components/dashboard/maintenance-timeline";
import { MaintenanceTaskList } from "@/components/vehicles/maintenance-task-list";
import { ServiceRecordTable } from "@/components/vehicles/service-record-table";
import { OdometerHistory } from "@/components/vehicles/odometer-history";
import { VehicleInspectionCard } from "@/components/vehicles/inspection-card";
import { VehicleForecastCard } from "@/components/vehicles/forecast-card";
import type { MaintenanceStatus } from "@/types/database";
import { EU } from "@/lib/eu";

export default async function VehicleDetailPage({
  params
}: {
  params: { vehicleId: string };
}) {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select(
      `
      id,
      user_id,
      nickname,
      make,
      model,
      year,
      vin,
      base_mileage,
      photo_url,
      created_at,
      maintenance_tasks (*),
      service_records (*),
      odometer_entries (*)
    `
    )
    .eq("id", params.vehicleId)
    .order("service_records(service_date)", { ascending: false })
    .order("odometer_entries(recorded_at)", { ascending: false })
    .single();

  if (!vehicle || vehicle.user_id !== session.user.id) {
    notFound();
  }

  const { data: inspectionData } = await supabase
    .from("vehicle_inspections")
    .select("country_code,first_registration_date,last_completed_date,next_due_date")
    .eq("vehicle_id", vehicle.id)
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  const inspection = inspectionData?.[0] ?? null;

  const { data: countries } = await supabase
    .from("eu_countries")
    .select("code, name")
    .order("name", { ascending: true });
  const countryOptions =
    countries ?? EU.COUNTRIES.map((code) => ({ code, name: code }));

  const { data: timelineData } = await supabase.rpc("get_timeline_events", {
    p_vehicle_id: vehicle.id
  });

  const forecastCountry =
    inspection?.country_code ?? countryOptions[0]?.code ?? "DE";

  const { data: forecastData } = await supabase.rpc("forecast_budget", {
    p_vehicle_id: vehicle.id,
    p_country: forecastCountry,
    p_months: 12
  });

  const vehicleMeta = {
    id: vehicle.id,
    nickname: vehicle.nickname,
    make: vehicle.make,
    model: vehicle.model
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          {vehicle.photo_url ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-800">
              <Image
                src={vehicle.photo_url}
                alt={vehicle.nickname ?? `${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-lg font-semibold text-slate-500">
              {vehicle.make[0]}
              {vehicle.model[0]}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              {vehicle.nickname ??
                `${vehicle.year ?? ""} ${vehicle.make} ${vehicle.model}`.trim()}
            </h1>
            <p className="text-sm text-slate-400">
              Added {EU.formatDateEU(vehicle.created_at)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
              <span className="rounded-full border border-slate-800 px-3 py-1">
                VIN {vehicle.vin ?? "Not set"}
              </span>
              <span className="rounded-full border border-slate-800 px-3 py-1">
                Base distance{" "}
                {vehicle.base_mileage ? EU.formatKm(vehicle.base_mileage) : "Not set"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/vehicles/${vehicle.id}/manage`}
            className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Manage vehicle
          </Link>
          <Link
            href={`/api/vehicles/${vehicle.id}/export`}
            className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Export PDF
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <VehicleInspectionCard
        vehicleId={vehicle.id}
        inspection={inspection}
        countries={countryOptions}
      />

      <VehicleForecastCard
        vehicleId={vehicle.id}
        country={forecastCountry}
        months={12}
        items={forecastData ?? []}
      />

      <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-100">
            Timeline overview
          </h2>
          <p className="text-xs text-slate-500">
            Track your latest maintenance, odometer logs, and service history.
          </p>
          <div className="mt-6">
            <MaintenanceTimeline
              events={
                (timelineData?.map((event) => ({
                  ...event,
                  vehicle_id: vehicle.id
                })) as {
                  id: string;
                  label: string;
                  type: "service" | "maintenance" | "odometer";
                  occurred_at: string;
                  mileage: number | null;
                  status: MaintenanceStatus | null;
                  vehicle_id?: string;
                }[]) ?? []
              }
              vehicles={[vehicleMeta]}
            />
          </div>
        </div>
        <QuickCapturePanel userId={session.user.id} vehicles={[vehicleMeta]} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <MaintenanceTaskList tasks={vehicle.maintenance_tasks ?? []} />
        <OdometerHistory entries={vehicle.odometer_entries ?? []} />
      </section>

      <ServiceRecordTable records={vehicle.service_records ?? []} />
    </div>
  );
}
