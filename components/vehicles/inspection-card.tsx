"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EU } from "@/lib/eu";

type InspectionCardProps = {
  vehicleId: string;
  countries: { code: string; name: string }[];
  inspection: {
    country_code: string;
    first_registration_date: string;
    last_completed_date: string | null;
    next_due_date: string;
  } | null;
};

export function VehicleInspectionCard({
  vehicleId,
  countries,
  inspection
}: InspectionCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const todayIso = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const [isEditing, setEditing] = useState(!inspection);
  const [countryCode, setCountryCode] = useState(
    inspection?.country_code ?? countries[0]?.code ?? ""
  );
  const [firstRegDate, setFirstRegDate] = useState(
    inspection?.first_registration_date ?? todayIso
  );
  const [lastPassDate, setLastPassDate] = useState(
    inspection?.last_completed_date ?? ""
  );

  useEffect(() => {
    if (inspection) {
      setCountryCode(inspection.country_code);
      setFirstRegDate(inspection.first_registration_date);
      setLastPassDate(inspection.last_completed_date ?? "");
      setEditing(false);
    } else {
      setEditing(true);
      if (!countryCode && countries.length) {
        setCountryCode(countries[0].code);
      }
      if (!firstRegDate) {
        setFirstRegDate(todayIso);
      }
    }
  }, [inspection, countries, countryCode, firstRegDate, todayIso]);

  const status = inspection
    ? new Date(inspection.next_due_date) < new Date()
      ? "overdue"
      : "scheduled"
    : "not-set";

  const statusStyles =
    status === "overdue"
      ? "badge-danger badge"
      : status === "scheduled"
        ? "badge-warning badge"
        : "badge";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!countryCode || !firstRegDate) {
      toast.error("Provide country and first registration date");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/vehicles/${vehicleId}/inspection`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              countryCode,
              firstRegDate,
              lastPassDate: lastPassDate || null
            })
          }
        );
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Unable to update inspection");
        }
        toast.success("Inspection schedule updated");
        setEditing(false);
        router.refresh();
      } catch (error) {
        toast.error("Inspection update failed", {
          description:
            error instanceof Error ? error.message : "Please try again."
        });
      }
    });
  };

  return (
    <section className="card h-full space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Roadworthiness inspection
          </h2>
          <p className="text-xs text-slate-500">
            Track the statutory inspection cadence based on EU rules.
          </p>
        </div>
        {inspection ? (
          <span className={`${statusStyles} text-[10px] uppercase`}>
            {status === "overdue" ? "Overdue" : "Scheduled"}
          </span>
        ) : null}
      </header>

      {inspection ? (
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            <span className="font-semibold text-slate-100">Country:</span>{" "}
            {countries.find((c) => c.code === inspection.country_code)?.name ??
              inspection.country_code}
          </p>
          <p>
            <span className="font-semibold text-slate-100">
              First registration:
            </span>{" "}
            {EU.formatDateEU(inspection.first_registration_date)}
          </p>
          <p>
            <span className="font-semibold text-slate-100">Last pass:</span>{" "}
            {inspection.last_completed_date
              ? EU.formatDateEU(inspection.last_completed_date)
              : "Not recorded"}
          </p>
          <p>
            <span className="font-semibold text-slate-100">Next due:</span>{" "}
            {EU.formatDateEU(inspection.next_due_date)}
          </p>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
          No inspection information yet. Provide registration details to get a
          projected due date.
        </p>
      )}

      {isEditing ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Registration country
            </label>
            <select
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              className="w-full"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="First registration date">
              <input
                type="date"
                value={firstRegDate}
                onChange={(event) => setFirstRegDate(event.target.value)}
                required
              />
            </Field>
            <Field label="Last passed inspection (optional)">
              <input
                type="date"
                value={lastPassDate}
                onChange={(event) => setLastPassDate(event.target.value)}
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2">
            {inspection ? (
              <button
                type="button"
                className="rounded-md border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-900"
                onClick={() => {
                  setEditing(false);
                  setCountryCode(inspection.country_code);
                  setFirstRegDate(inspection.first_registration_date);
                  setLastPassDate(inspection.last_completed_date ?? "");
                }}
              >
                Cancel
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save inspection"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-md border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-900"
            onClick={() => setEditing(true)}
          >
            Update inspection info
          </button>
        </div>
      )}
    </section>
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
