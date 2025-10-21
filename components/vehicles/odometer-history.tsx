"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { format } from "date-fns";
import type { Database } from "@/types/database";
import { EU } from "@/lib/eu";

type OdometerEntry = Database["public"]["Tables"]["odometer_entries"]["Row"];

type OdometerHistoryProps = {
  entries: OdometerEntry[];
};

export function OdometerHistory({ entries }: OdometerHistoryProps) {
  const sortedEntries = [...entries].sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const data = sortedEntries.map((entry) => ({
    date: format(new Date(entry.recorded_at), "dd.MM"),
    mileage: entry.mileage,
    confidence:
      entry.confidence !== null
        ? Math.round(Math.min(entry.confidence, 1) * 100)
        : null
  }));

  return (
    <section className="card h-full space-y-5 p-6">
      <header>
        <h2 className="text-lg font-semibold text-slate-100">
          Odometer history
        </h2>
        <p className="text-xs text-slate-500">
          Monitor mileage trends from photo uploads or manual entries.
        </p>
      </header>

      {data.length >= 2 ? (
        <div className="h-60 w-full">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMileage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis
                stroke="#64748b"
                tickFormatter={(value: number) =>
                  `${(value / 1000).toFixed(0)}k km`
                }
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: "#334155" }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "0.75rem"
                }}
                formatter={(value: number) => [EU.formatKm(value), "Odometer"]}
              />
              <Area
                type="monotone"
                dataKey="mileage"
                stroke="#38bdf8"
                fillOpacity={1}
                fill="url(#colorMileage)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
          Add at least two odometer entries to visualize your mileage trend.
        </p>
      )}

      <ul className="space-y-3 text-sm">
        {sortedEntries
          .reverse()
          .slice(0, 6)
          .map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
            >
              <div>
                <p className="text-base font-semibold text-slate-100">
                  {EU.formatKm(entry.mileage)}
                </p>
                <p className="text-xs text-slate-500">
                  {EU.formatDateEU(entry.recorded_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                {entry.confidence !== null ? (
                  <span className="text-xs text-slate-400">
                    OCR confidence {(entry.confidence * 100).toFixed(0)}%
                  </span>
                ) : null}
                <span
                  className={
                    entry.provenance === "odometer_photo_verified"
                      ? "badge badge-warning"
                      : entry.provenance === "shop_verified_api"
                        ? "badge badge-success"
                        : entry.provenance === "user_verified_receipt"
                          ? "badge badge-success"
                          : "badge"
                  }
                >
                  {entry.provenance === "odometer_photo_verified"
                    ? "Photo verified"
                    : entry.provenance === "user_verified_receipt"
                      ? "Receipt verified"
                      : entry.provenance === "shop_verified_api"
                        ? "Shop verified"
                        : "Manual"}
                </span>
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
}
