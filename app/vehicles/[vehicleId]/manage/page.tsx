import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ManageVehicleForm } from "@/components/vehicles/manage-vehicle-form";
import { TemplateSeedPanel } from "@/components/vehicles/template-seed-panel";
import { DeleteVehiclePanel } from "@/components/vehicles/delete-vehicle-panel";

export default async function ManageVehiclePage({
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
      created_at
    `
    )
    .eq("id", params.vehicleId)
    .single();

  if (!vehicle || vehicle.user_id !== session.user.id) {
    notFound();
  }

  const { count: taskCount } = await supabase
    .from("maintenance_tasks")
    .select("*", { count: "exact", head: true })
    .eq("vehicle_id", vehicle.id);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Vehicle settings
        </p>
        <h1 className="text-3xl font-bold text-slate-100">
          {vehicle.nickname ??
            `${vehicle.year ?? ""} ${vehicle.make} ${vehicle.model}`.trim()}
        </h1>
        <p className="text-sm text-slate-400">
          Update core details, refresh maintenance templates, or remove this
          vehicle from AutoSync.
        </p>
      </header>

      <section className="card p-6">
        <ManageVehicleForm vehicle={vehicle} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <TemplateSeedPanel
          vehicleId={vehicle.id}
          make={vehicle.make}
          model={vehicle.model}
          taskCount={taskCount ?? 0}
        />
        <DeleteVehiclePanel vehicleId={vehicle.id} vehicleName={vehicle.nickname ?? `${vehicle.make} ${vehicle.model}`} />
      </section>
    </div>
  );
}
