import { format } from "date-fns";
import clsx from "clsx";
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

type VehicleMeta = {
  id: string;
  nickname: string | null;
  make: string;
  model: string;
};

type MaintenanceTimelineProps = {
  events: TimelineEvent[];
  vehicles: VehicleMeta[];
};

export function MaintenanceTimeline({
  events,
  vehicles
}: MaintenanceTimelineProps) {
  const formatted = [...events]
    .sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    )
    .slice(0, 12);

  const getVehicleLabel = (vehicleId?: string) => {
    if (!vehicleId) return null;
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) return null;
    return (
      vehicle.nickname ??
      `${vehicle.make} ${vehicle.model}`.trim()
    );
  };

  return (
    <section className="card h-full space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Activity timeline
          </h2>
          <p className="text-xs text-slate-500">
            Track odometer captures, services, and maintenance history.
          </p>
        </div>
      </header>
      <div className="relative">
        <div className="absolute left-3 h-full w-px bg-slate-800" />
        <ul className="space-y-5 pl-10">
          {formatted.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
              Timeline is empty. Log a service record or odometer photo to see
              your history.
            </li>
          ) : (
            formatted.map((event) => (
              <li key={event.id} className="relative">
                <span
                  className={clsx(
                    "absolute left-[-32px] top-1.5 h-2.5 w-2.5 rounded-full border border-slate-900",
                    event.type === "service"
                      ? "bg-success"
                      : event.type === "maintenance"
                        ? "bg-warning"
                        : "bg-sky-400"
                  )}
                />
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-100">
                      {event.label}
                    </p>
                    <span className="text-xs text-slate-500">
                      {format(new Date(event.occurred_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {event.mileage ? (
                      <span>{event.mileage.toLocaleString()} mi</span>
                    ) : null}
                    {event.status ? (
                      <span className="uppercase tracking-wide text-slate-500">
                        {event.status}
                      </span>
                    ) : null}
                    {event.vehicle_id ? (
                      <span className="text-slate-500">
                        {getVehicleLabel(event.vehicle_id)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
