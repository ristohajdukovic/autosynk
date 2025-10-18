"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { format, addMonths } from "date-fns";
import clsx from "clsx";
import { toast } from "sonner";
import type { Database, MaintenanceStatus } from "@/types/database";

type Task = Database["public"]["Tables"]["maintenance_tasks"]["Row"];

type MaintenanceTaskListProps = {
  tasks: Task[];
};

const badgeClass: Record<MaintenanceStatus, string> = {
  completed: "badge-success",
  overdue: "badge-danger",
  upcoming: "badge-warning"
};

export function MaintenanceTaskList({ tasks }: MaintenanceTaskListProps) {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const [isWorking, setIsWorking] = useState<string | null>(null);

  const markCompleted = async (task: Task) => {
    const mileageInput = window.prompt(
      "Enter mileage at completion (optional)",
      task.next_due_mileage?.toString() ?? ""
    );
    const mileageValue =
      mileageInput && mileageInput.trim().length
        ? Number(mileageInput)
        : null;
    const completionDate = new Date();

    const nextDueMileage =
      mileageValue !== null && task.interval_miles
        ? mileageValue + task.interval_miles
        : null;
    const nextDueDate = task.interval_months
      ? addMonths(completionDate, task.interval_months).toISOString()
      : null;

    setIsWorking(task.id);
    const { error } = await supabase
      .from("maintenance_tasks")
      .update({
        status: "completed",
        last_completed_mileage: mileageValue,
        last_completed_date: completionDate.toISOString(),
        next_due_mileage: nextDueMileage,
        next_due_date: nextDueDate
      })
      .eq("id", task.id);

    setIsWorking(null);

    if (error) {
      toast.error("Unable to update task", { description: error.message });
      return;
    }

    toast.success("Task marked as completed");
    router.refresh();
  };

  const revertToUpcoming = async (task: Task) => {
    setIsWorking(task.id);
    const { error } = await supabase
      .from("maintenance_tasks")
      .update({
        status: "upcoming"
      })
      .eq("id", task.id);
    setIsWorking(null);

    if (error) {
      toast.error("Unable to revert status", { description: error.message });
      return;
    }

    toast.success("Task reset to upcoming");
    router.refresh();
  };

  if (!tasks.length) {
    return (
      <section className="card h-full space-y-3 p-6">
        <header>
          <h2 className="text-lg font-semibold text-slate-100">
            Maintenance plan
          </h2>
          <p className="text-xs text-slate-500">
            Auto-generated reminders for predictable upkeep.
          </p>
        </header>
        <p className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
          No maintenance tasks yet. Create one using the quick capture panel.
        </p>
      </section>
    );
  }

  return (
    <section className="card h-full space-y-5 p-6">
      <header>
        <h2 className="text-lg font-semibold text-slate-100">
          Maintenance plan
        </h2>
        <p className="text-xs text-slate-500">
          Maintain healthy intervals with quick status updates and completions.
        </p>
      </header>

      <ul className="space-y-3 text-sm">
        {tasks
          .sort((a, b) => {
            const aDate = a.next_due_date
              ? new Date(a.next_due_date).getTime()
              : Number.POSITIVE_INFINITY;
            const bDate = b.next_due_date
              ? new Date(b.next_due_date).getTime()
              : Number.POSITIVE_INFINITY;
            return aDate - bDate;
          })
          .map((task) => (
            <li
              key={task.id}
              className="rounded-lg border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-100">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {task.description ?? "Custom reminder"}
                  </p>
                </div>
                <span className={clsx("text-[10px]", badgeClass[task.status])}>
                  {task.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-3 grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
                <div>
                  <span className="font-semibold text-slate-300">
                    Next due date:
                  </span>{" "}
                  {task.next_due_date
                    ? format(new Date(task.next_due_date), "MMM d, yyyy")
                    : "Not set"}
                </div>
                <div>
                  <span className="font-semibold text-slate-300">
                    Next due mileage:
                  </span>{" "}
                  {task.next_due_mileage
                    ? `${task.next_due_mileage.toLocaleString()} mi`
                    : "Not set"}
                </div>
                {task.interval_miles ? (
                  <div>
                    Interval: {task.interval_miles.toLocaleString()} miles
                  </div>
                ) : null}
                {task.interval_months ? (
                  <div>Interval: every {task.interval_months} months</div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => markCompleted(task)}
                  disabled={isWorking === task.id}
                  className="rounded-md bg-success/20 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-success/30 disabled:opacity-60"
                >
                  {isWorking === task.id ? "Updating..." : "Mark completed"}
                </button>
                {task.status === "completed" ? (
                  <button
                    type="button"
                    onClick={() => revertToUpcoming(task)}
                    disabled={isWorking === task.id}
                    className="rounded-md border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-900 disabled:opacity-60"
                  >
                    Set to upcoming
                  </button>
                ) : null}
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
}
