import Link from "next/link";
import type { MaintenanceStatus } from "@/types/database";
import { EU } from "@/lib/eu";

type VehicleCardProps = {
  vehicle: {
    id: string;
    nickname: string | null;
    make: string;
    model: string;
    year: number | null;
    photo_url: string | null;
    base_mileage: number | null;
    maintenance_tasks: {
      id: string;
      title: string;
      status: MaintenanceStatus;
      next_due_date: string | null;
      next_due_mileage: number | null;
    }[];
    odometer_entries: {
      id: string;
      mileage: number;
      recorded_at: string;
    }[];
    service_records: {
      id: string;
      title: string;
      service_date: string;
      mileage: number | null;
    }[];
  };
};

const statusBadgeClass = {
  completed: "badge-success",
  upcoming: "badge-warning",
  overdue: "badge-danger"
} as const;

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const latestOdometer = [...(vehicle.odometer_entries ?? [])].sort(
    (a, b) =>
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  )[0];
  const lastService = [...(vehicle.service_records ?? [])].sort(
    (a, b) =>
      new Date(b.service_date).getTime() - new Date(a.service_date).getTime()
  )[0];
  const overdueCount =
    vehicle.maintenance_tasks?.filter((task) => task.status === "overdue")
      ?.length ?? 0;
  const upcomingCount =
    vehicle.maintenance_tasks?.filter((task) => task.status === "upcoming")
      ?.length ?? 0;

  const vehicleTitle =
    vehicle.nickname ??
    `${vehicle.year ?? ""} ${vehicle.make} ${vehicle.model}`.trim();

  return (
    <div className="card flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="text-xl font-semibold text-slate-100 hover:text-sky-300"
          >
            {vehicleTitle}
          </Link>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {vehicle.make} - {vehicle.model}
            {vehicle.year ? ` - ${vehicle.year}` : ""}
          </p>
        </div>
        {overdueCount > 0 && (
          <span className="badge-danger badge text-xs">
            {overdueCount} overdue
          </span>
        )}
      </div>

      <div className="grid gap-3 text-sm text-slate-300">
        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2">
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Current odometer
            </span>
            <p className="text-base font-semibold text-slate-100">
              {latestOdometer?.mileage
                ? EU.formatKm(latestOdometer.mileage)
                : vehicle.base_mileage
                  ? EU.formatKm(vehicle.base_mileage)
                  : "Not set"}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            {latestOdometer
              ? `Updated ${EU.formatDateEU(latestOdometer.recorded_at)}`
              : "Log a photo"}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2">
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Upcoming tasks
            </span>
            <p className="text-base font-semibold text-slate-100">
              {upcomingCount} scheduled
            </p>
          </div>
          <div className="flex gap-2 text-xs text-slate-400">
            {vehicle.maintenance_tasks?.slice(0, 2).map((task) => (
              <span
                key={task.id}
                className={`${statusBadgeClass[task.status]} hidden sm:flex`}
              >
                {task.title}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2">
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Last service
            </span>
            <p className="text-base font-semibold text-slate-100">
              {lastService
                ? `${lastService.title} - ${EU.formatDateEU(lastService.service_date)}`
                : "Add a record"}
            </p>
          </div>
          {lastService?.mileage && (
            <span className="text-xs text-slate-500">
              {EU.formatKm(lastService.mileage)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 text-xs font-semibold uppercase tracking-wide">
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="rounded-md border border-slate-800 px-3 py-1.5 text-slate-300 transition hover:bg-slate-900"
        >
          View details
        </Link>
        <Link
          href={`/vehicles/${vehicle.id}/manage`}
          className="rounded-md bg-sky-500 px-3 py-1.5 text-slate-950 transition hover:bg-sky-400"
        >
          Manage vehicle
        </Link>
      </div>
    </div>
  );
}
