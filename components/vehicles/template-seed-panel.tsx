"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { seedVehicleTasks } from "@/lib/vehicles/seed-tasks";
import { inferFuelType } from "@/lib/vehicles/infer-fuel";

type TemplateSeedPanelProps = {
  vehicleId: string;
  make: string;
  model: string;
  taskCount: number;
};

export function TemplateSeedPanel({
  vehicleId,
  make,
  model,
  taskCount
}: TemplateSeedPanelProps) {
  const router = useRouter();
  const [fuel, setFuel] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSeed = () => {
    startTransition(async () => {
      try {
        const { inserted } = await seedVehicleTasks({
          vehicleId,
          make,
          model,
          fuel: fuel || inferFuelType({ make, model })
        });
        toast.success("Maintenance plan seeded", {
          description: `${inserted} tasks added from template`
        });
        router.refresh();
      } catch (error) {
        toast.error("Unable to seed tasks", {
          description:
            error instanceof Error ? error.message : "Try again later."
        });
      }
    });
  };

  return (
    <div className="card space-y-4 p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-100">
          Maintenance templates
        </h2>
        <p className="text-sm text-slate-400">
          Seed or refresh tasks from the AutoSync template library. Existing
          tasks are left untouched.
        </p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
        <p>
          <span className="font-semibold text-slate-100">Make:</span> {make}
        </p>
        <p>
          <span className="font-semibold text-slate-100">Model:</span> {model}
        </p>
        <p>
          <span className="font-semibold text-slate-100">Existing tasks:</span>{" "}
          {taskCount}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
          Fuel type override (optional)
        </label>
        <input
          value={fuel}
          onChange={(event) => setFuel(event.target.value)}
          placeholder="EV, HEV, ICE/HEV..."
        />
      </div>

      <button
        type="button"
        onClick={handleSeed}
        disabled={isPending}
        className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
      >
        {isPending ? "Seeding..." : "Seed maintenance tasks"}
      </button>
    </div>
  );
}
