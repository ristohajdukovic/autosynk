"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addMonths } from "date-fns";
import clsx from "clsx";
import { toast } from "sonner";
import type { Database, MaintenanceStatus } from "@/types/database";
import { EU } from "@/lib/eu";

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
  const [quoteTask, setQuoteTask] = useState<Task | null>(null);
  const [quoteDetails, setQuoteDetails] = useState("");
  const [quoteCity, setQuoteCity] = useState("");
  const [quoteCountry, setQuoteCountry] = useState<string>(EU.COUNTRIES[0]);
  const [isQuoteOpen, setQuoteOpen] = useState(false);
  const [isSubmittingQuote, setSubmittingQuote] = useState(false);

  const markCompleted = async (task: Task) => {
    const mileageInput = window.prompt(
      "Enter odometer reading in kilometres (optional)",
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

  const openQuoteModal = (task: Task) => {
    setQuoteTask(task);
    setQuoteCountry(EU.COUNTRIES[0]);
    setQuoteDetails("");
    setQuoteCity("");
    setQuoteOpen(true);
  };

  const closeQuoteModal = () => {
    setQuoteOpen(false);
    setQuoteTask(null);
    setSubmittingQuote(false);
  };

  const submitQuoteRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quoteTask) return;

    setSubmittingQuote(true);
    try {
      const { error } = await supabase.from("quote_requests").insert({
        vehicle_id: quoteTask.vehicle_id,
        task_title: quoteTask.title,
        details: quoteDetails.trim() || null,
        country_code: quoteCountry,
        city: quoteCity.trim() || null,
        created_by: quoteTask.created_by
      });

      if (error) throw error;

      toast.success("Quote request submitted");
      closeQuoteModal();
      router.refresh();
    } catch (error) {
      toast.error("Unable to submit quote request", {
        description:
          error instanceof Error ? error.message : "Please try again later."
      });
      setSubmittingQuote(false);
    }
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
                    ? EU.formatDateEU(task.next_due_date)
                    : "Not set"}
                </div>
                <div>
                  <span className="font-semibold text-slate-300">
                    Next due kilometres:
                  </span>{" "}
                  {task.next_due_mileage
                    ? EU.formatKm(task.next_due_mileage)
                    : "Not set"}
                </div>
                {task.interval_miles ? (
                  <div>
                    Interval: {EU.formatKm(task.interval_miles)}
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
                <button
                  type="button"
                  onClick={() => openQuoteModal(task)}
                  className="rounded-md border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-900"
                >
                  Request quotes
                </button>
              </div>
            </li>
          ))}
      </ul>

      {isQuoteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8">
          <div className="card w-full max-w-md space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-100">
              Request maintenance quotes
            </h3>
            <p className="text-xs text-slate-500">
              Describe the work you need and your location. We&apos;ll notify partners in your region.
            </p>
            <form className="space-y-4" onSubmit={submitQuoteRequest}>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-400">
                  Task
                </label>
                <Input
                  value={quoteTask?.title ?? ""}
                  disabled
                  className="w-full cursor-not-allowed bg-slate-900 text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-400">
                  Country
                </label>
                <Select
                  value={quoteCountry}
                  onChange={(event) => setQuoteCountry(event.target.value)}
                  className="w-full"
                >
                  {EU.COUNTRIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-400">
                  City
                </label>
                <Input
                  type="text"
                  value={quoteCity}
                  onChange={(event) => setQuoteCity(event.target.value)}
                  placeholder="e.g. Berlin"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-400">
                  Details
                </label>
                <Textarea
                  rows={4}
                  value={quoteDetails}
                  onChange={(event) => setQuoteDetails(event.target.value)}
                  placeholder="Describe the symptoms, preferred timing, or any parts you have already sourced."
                  className="w-full"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeQuoteModal}
                  className="rounded-md border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-900"
                  disabled={isSubmittingQuote}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
                >
                  {isSubmittingQuote ? "Sending..." : "Submit request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
