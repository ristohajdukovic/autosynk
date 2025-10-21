"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ManageVehicleFormProps = {
  vehicle: {
    id: string;
    nickname: string | null;
    make: string;
    model: string;
    year: number | null;
    vin: string | null;
    base_mileage: number | null;
  };
};

export function ManageVehicleForm({ vehicle }: ManageVehicleFormProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState(vehicle.nickname ?? "");
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState<string>(
    vehicle.year ? String(vehicle.year) : ""
  );
  const [vin, setVin] = useState(vehicle.vin ?? "");
  const [baseMileage, setBaseMileage] = useState<string>(
    vehicle.base_mileage ? String(vehicle.base_mileage) : ""
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const response = await fetch(`/api/vehicles/${vehicle.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nickname: nickname.trim() === "" ? null : nickname.trim(),
            make: make.trim(),
            model: model.trim(),
            year: year ? Number(year) : null,
            vin: vin.trim() === "" ? null : vin.trim(),
            base_mileage: baseMileage ? Number(baseMileage) : null
          })
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Update failed");
        }

        toast.success("Vehicle updated");
        router.refresh();
      } catch (error) {
        toast.error("Unable to update vehicle", {
          description:
            error instanceof Error ? error.message : "Please try again."
        });
      }
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-100">
          Vehicle details
        </h2>
        <p className="text-sm text-slate-400">
          Manage base information used across reminders, timeline entries, and
          exports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Make">
          <input
            value={make}
            onChange={(event) => setMake(event.target.value)}
            required
          />
        </Field>
        <Field label="Model">
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nickname">
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="Daily Driver"
          />
        </Field>
        <Field label="Year">
          <input
            type="number"
            inputMode="numeric"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="2022"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="VIN">
          <input
            value={vin}
            onChange={(event) => setVin(event.target.value.toUpperCase())}
            placeholder="1HGCM82633A004352"
          />
        </Field>
        <Field label="Base distance (km)">
          <input
            type="number"
            inputMode="numeric"
            value={baseMileage}
            onChange={(event) => setBaseMileage(event.target.value)}
            placeholder="124500"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}
