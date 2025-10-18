import { format } from "date-fns";
import type { Database } from "@/types/database";

type ServiceRecord = Database["public"]["Tables"]["service_records"]["Row"];

type ServiceRecordTableProps = {
  records: ServiceRecord[];
};

export function ServiceRecordTable({ records }: ServiceRecordTableProps) {
  const sorted = [...records].sort(
    (a, b) =>
      new Date(b.service_date).getTime() - new Date(a.service_date).getTime()
  );

  return (
    <section className="card space-y-5 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Service logbook
          </h2>
          <p className="text-xs text-slate-500">
            Keep an audit trail of maintenance with costs and notes.
          </p>
        </div>
      </header>

      {sorted.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
          No service records yet. Log work from a mechanic or maintenance you
          complete yourself to build your digital history.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Service</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Mileage</th>
                <th className="px-4 py-3 text-left font-semibold">Cost</th>
                <th className="px-4 py-3 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sorted.map((record) => (
                <tr key={record.id} className="bg-slate-900/40">
                  <td className="px-4 py-3 font-semibold text-slate-100">
                    {record.title}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {format(new Date(record.service_date), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {record.mileage
                      ? `${record.mileage.toLocaleString()} mi`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {record.cost ? `$${record.cost.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {record.notes ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
