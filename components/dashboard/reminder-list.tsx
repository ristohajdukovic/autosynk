import { formatDistanceToNow } from "date-fns";
import type { Database, MaintenanceStatus } from "@/types/database";
import { EU } from "@/lib/eu";

type Reminder = Database["public"]["Tables"]["maintenance_tasks"]["Row"];

const statusCopy: Record<MaintenanceStatus, string> = {
  overdue: "Overdue",
  upcoming: "Upcoming",
  completed: "Completed"
};

const badgeClass: Record<MaintenanceStatus, string> = {
  overdue: "badge-danger",
  upcoming: "badge-warning",
  completed: "badge-success"
};

type ReminderListProps = {
  tasks: Reminder[];
};

export function ReminderList({ tasks }: ReminderListProps) {
  const hasReminders = tasks.length > 0;

  return (
    <aside className="card h-full space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Smart reminders
          </h2>
          <p className="text-xs text-slate-500">
            Time and distance based alerts generated from your maintenance plan.
          </p>
        </div>
      </header>

      {!hasReminders ? (
        <p className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
          No reminders yet. Add a maintenance task to start tracking upcoming
          work.
        </p>
      ) : (
        <ul className="space-y-3 text-sm">
          {tasks.map((task) => {
            const dueDate = task.next_due_date
              ? new Date(task.next_due_date)
              : null;
            const dueMileage = task.next_due_mileage
              ? EU.formatKm(task.next_due_mileage)
              : null;

            return (
              <li
                key={task.id}
                className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-100">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {task.description ?? "Auto-generated maintenance interval"}
                    </p>
                  </div>
                  <span className={`${badgeClass[task.status]} text-[10px]`}>
                    {statusCopy[task.status]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {dueDate && (
                    <span>
                      Due{" "}
                      {formatDistanceToNow(dueDate, {
                        addSuffix: true
                      })}
                    </span>
                  )}
                  {dueMileage && <span>Next at {dueMileage}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
