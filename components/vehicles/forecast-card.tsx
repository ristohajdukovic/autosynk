"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { EU } from "@/lib/eu";

type ForecastItem = {
  month: string;
  estimated_eur: number | null;
  breakdown: Record<string, unknown> | null;
};

type VehicleForecastCardProps = {
  vehicleId: string;
  country: string;
  months: number;
  items: ForecastItem[];
};

export function VehicleForecastCard({
  vehicleId,
  country,
  months,
  items
}: VehicleForecastCardProps) {
  const [isDownloading, startTransition] = useTransition();

  const total =
    items?.reduce((sum, item) => sum + (item.estimated_eur ?? 0), 0) ?? 0;

  const handleDownload = (targetMonths: number) =>
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/vehicles/${vehicleId}/forecast?country=${country}&months=${targetMonths}&format=csv`
        );

        if (!response.ok) {
          const payload = await response.text();
          throw new Error(payload);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `forecast-${vehicleId}-${country}-${targetMonths}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Forecast CSV downloaded");
      } catch (error) {
        toast.error("Unable to export forecast", {
          description:
            error instanceof Error ? error.message : "Please try again later."
        });
      }
    });

  return (
    <section className="card space-y-5 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Forecast ({months} months)
          </h2>
          <p className="text-xs text-slate-500">
            Estimated maintenance budget in {country.toUpperCase()} based on
            template tasks and EU cost baselines.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-900 disabled:opacity-60"
            onClick={() => handleDownload(12)}
            disabled={isDownloading}
          >
            Export 12m CSV
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-900 disabled:opacity-60"
            onClick={() => handleDownload(24)}
            disabled={isDownloading}
          >
            Export 24m CSV
          </button>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
          No forecast available yet. Add upcoming maintenance tasks to project
          future costs.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Month</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Estimated cost
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((item) => {
                  const date = new Date(item.month);
                  return (
                    <tr key={item.month} className="bg-slate-900/40">
                      <td className="px-4 py-3 text-slate-300">
                        {EU.formatDateEU(date)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-100">
                        {EU.formatEUR(item.estimated_eur ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {describeBreakdown(item.breakdown)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-300">
            <span className="font-semibold text-slate-100">Total</span>
            <span className="font-semibold text-slate-100">
              {EU.formatEUR(total)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function describeBreakdown(
  breakdown: Record<string, unknown> | null
): string {
  if (!breakdown) return "Template baseline";
  const title = typeof breakdown.title === "string" ? breakdown.title : null;
  const interval =
    typeof breakdown.assumed_interval_months === "number"
      ? breakdown.assumed_interval_months
      : null;

  if (title && interval) return `${title} · ${interval} month interval`;
  if (title) return title;
  return "Template baseline";
}
