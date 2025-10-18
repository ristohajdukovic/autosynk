import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { AddVehicleForm } from "@/components/vehicles/add-vehicle-form";

export default async function NewVehiclePage() {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-100">Add a vehicle</h1>
        <p className="text-sm text-slate-400">
          Provide key details so we can tailor maintenance reminders and
          mileage tracking.
        </p>
      </header>

      <div className="card p-8">
        <AddVehicleForm userId={session.user.id} />
      </div>
    </div>
  );
}
