"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Database } from "@/types/database";

type VehicleOption = {
  id: string;
  nickname: string | null;
  make: string;
  model: string;
  base_mileage?: number | null;
};

type QuickCapturePanelProps = {
  userId: string;
  vehicles: VehicleOption[];
};

type Tab = "odometer" | "service" | "task";

const odometerSchema = z.object({
  vehicleId: z.string().uuid(),
  mileage: z
    .number({
      invalid_type_error: "Kilometres is required"
    })
    .min(0),
  confidence: z
    .number({
      invalid_type_error: "Confidence must be a number"
    })
    .min(0)
    .max(100)
    .optional(),
  notes: z.string().max(200).optional(),
  recordedAt: z.date()
});

const serviceSchema = z.object({
  vehicleId: z.string().uuid(),
  title: z.string().min(3),
  serviceDate: z.date(),
  mileage: z
    .number({
      invalid_type_error: "Kilometres must be a number"
    })
    .min(0)
    .optional(),
  cost: z
    .number({
      invalid_type_error: "Cost must be numeric"
    })
    .nonnegative()
    .optional(),
  notes: z.string().max(400).optional()
});

const taskSchema = z.object({
  vehicleId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().max(240).optional(),
  intervalMiles: z
    .number({
      invalid_type_error: "Interval must be numeric"
    })
    .min(100)
    .optional(),
  intervalMonths: z
    .number({
      invalid_type_error: "Interval must be numeric"
    })
    .min(1)
    .max(60)
    .optional(),
  nextDueKilometres: z
    .number({
      invalid_type_error: "Kilometres must be numeric"
    })
    .min(0)
    .optional(),
  nextDueDate: z.date().optional()
});

export function QuickCapturePanel({
  userId,
  vehicles
}: QuickCapturePanelProps) {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("odometer");
  const [odometerPhoto, setOdometerPhoto] = useState<File | null>(null);

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        value: vehicle.id,
        label:
          vehicle.nickname ?? `${vehicle.make} ${vehicle.model}`.trim()
      })),
    [vehicles]
  );

  const {
    register: registerOdometer,
    handleSubmit: handleSubmitOdometer,
    reset: resetOdometer,
    formState: { isSubmitting: isSubmittingOdometer, errors: odometerErrors }
  } = useForm<z.infer<typeof odometerSchema>>({
    resolver: zodResolver(odometerSchema),
    defaultValues: {
      recordedAt: new Date()
    } as Partial<z.infer<typeof odometerSchema>>
  });

  const {
    register: registerService,
    handleSubmit: handleSubmitService,
    reset: resetService,
    formState: { isSubmitting: isSubmittingService, errors: serviceErrors }
  } = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceDate: new Date()
    } as Partial<z.infer<typeof serviceSchema>>
  });

  const {
    register: registerTask,
    handleSubmit: handleSubmitTask,
    reset: resetTask,
    formState: { isSubmitting: isSubmittingTask, errors: taskErrors }
  } = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema)
  });

  const onSubmitOdometer = handleSubmitOdometer(async (data) => {
    try {
      let photoUrl: string | null = null;
      if (odometerPhoto) {
        const path = `${userId}/${data.vehicleId}/${Date.now()}-${odometerPhoto.name}`;
        const { error: uploadError } = await supabase.storage
          .from("odometer-photos")
          .upload(path, odometerPhoto, {
            cacheControl: "3600",
            upsert: false
          });
        if (uploadError) {
          throw uploadError;
        }
        const { data: publicUrl } = supabase.storage
          .from("odometer-photos")
          .getPublicUrl(path);
        photoUrl = publicUrl.publicUrl;
      }

      const { error } = await supabase.from("odometer_entries").insert({
        vehicle_id: data.vehicleId,
        mileage: data.mileage,
        confidence:
          typeof data.confidence === "number"
            ? data.confidence / 100
            : null,
        recorded_at: data.recordedAt.toISOString(),
        notes: data.notes ?? null,
        photo_url: photoUrl,
        provenance: photoUrl ? "odometer_photo_verified" : "manual",
        created_by: userId
      });
      if (error) throw error;

      toast.success("Odometer log saved");
      resetOdometer();
      setOdometerPhoto(null);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save odometer log";
      toast.error("Save failed", { description: message });
    }
  });

  const onSubmitService = handleSubmitService(async (data) => {
    try {
      const { error } = await supabase.from("service_records").insert({
        vehicle_id: data.vehicleId,
        title: data.title,
        service_date: data.serviceDate.toISOString(),
        mileage: data.mileage ?? null,
        cost: data.cost ?? null,
        notes: data.notes ?? null,
        attachments: null,
        provenance: "manual",
        created_by: userId
      });
      if (error) throw error;
      toast.success("Service record added");
      resetService();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add service record";
      toast.error("Save failed", { description: message });
    }
  });

  const onSubmitTask = handleSubmitTask(async (data) => {
    try {
      const { error } = await supabase.from("maintenance_tasks").insert({
        vehicle_id: data.vehicleId,
        title: data.title,
        description: data.description ?? null,
        interval_miles: data.intervalMiles ?? null,
        interval_months: data.intervalMonths ?? null,
        next_due_mileage: data.nextDueKilometres ?? null,
        next_due_date: data.nextDueDate
          ? data.nextDueDate.toISOString()
          : null,
        status: "upcoming",
        created_by: userId
      });
      if (error) throw error;
      toast.success("Reminder scheduled");
      resetTask();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create reminder";
      toast.error("Save failed", { description: message });
    }
  });

  const renderErrors = (errors: Record<string, { message?: string }>) => (
    <ul className="space-y-1 text-xs text-danger">
      {Object.values(errors)
        .filter(Boolean)
        .map((error, index) =>
          error?.message ? <li key={index}>{error.message}</li> : null
        )}
    </ul>
  );

  return (
    <aside className="card h-full space-y-6 p-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-100">Quick capture</h2>
        <p className="text-xs text-slate-500">
          Log odometer photos, add service records, or schedule reminders.
        </p>
      </header>

      <div className="flex gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <button
          type="button"
          className={`flex-1 rounded-lg border px-4 py-2 transition ${
            activeTab === "odometer"
              ? "border-sky-500 bg-sky-500/15 text-sky-200"
              : "border-slate-800 bg-slate-900/40 hover:bg-slate-900"
          }`}
          onClick={() => setActiveTab("odometer")}
        >
          Odometer
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg border px-4 py-2 transition ${
            activeTab === "service"
              ? "border-sky-500 bg-sky-500/15 text-sky-200"
              : "border-slate-800 bg-slate-900/40 hover:bg-slate-900"
          }`}
          onClick={() => setActiveTab("service")}
        >
          Service
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg border px-4 py-2 transition ${
            activeTab === "task"
              ? "border-sky-500 bg-sky-500/15 text-sky-200"
              : "border-slate-800 bg-slate-900/40 hover:bg-slate-900"
          }`}
          onClick={() => setActiveTab("task")}
        >
          Reminder
        </button>
      </div>

      {activeTab === "odometer" && (
        <form className="space-y-4" onSubmit={onSubmitOdometer}>
          <SelectField
            label="Vehicle"
            options={vehicleOptions}
            {...registerOdometer("vehicleId")}
          />
          <NumberField
            label="Kilometres"
            placeholder="125000"
            {...registerOdometer("mileage", {
              valueAsNumber: true
            })}
          />
          <NumberField
            label="Confidence (%)"
            placeholder="90"
            {...registerOdometer("confidence", {
              setValueAs: (value) =>
                value === "" ? undefined : Number(value)
            })}
          />
          <DateField
            label="Recorded at"
            {...registerOdometer("recordedAt", {
              setValueAs: (value: string) =>
                value ? new Date(value) : new Date()
            })}
          />
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              Odometer photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setOdometerPhoto(event.currentTarget.files?.[0] ?? null)
              }
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Optional comments"
              {...registerOdometer("notes")}
            />
          </div>

          {Object.keys(odometerErrors).length > 0 &&
            renderErrors(odometerErrors as Record<string, { message?: string }>)}

          <button
            type="submit"
            disabled={isSubmittingOdometer}
            className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            {isSubmittingOdometer ? "Saving..." : "Save odometer log"}
          </button>
        </form>
      )}

  {activeTab === "service" && (
        <form className="space-y-4" onSubmit={onSubmitService}>
          <SelectField
            label="Vehicle"
            options={vehicleOptions}
            {...registerService("vehicleId")}
          />
          <TextField
            label="Service performed"
            placeholder="Oil change"
            {...registerService("title")}
          />
          <DateField
            label="Service date"
            {...registerService("serviceDate", {
              setValueAs: (value: string) =>
                value ? new Date(value) : new Date()
            })}
          />
          <NumberField
            label="Kilometres"
            placeholder="125200"
            {...registerService("mileage", {
              setValueAs: (value) =>
                value === "" ? undefined : Number(value)
            })}
          />
          <NumberField
            label="Cost"
            step="0.01"
            placeholder="125.00"
            {...registerService("cost", {
              setValueAs: (value) =>
                value === "" ? undefined : Number(value)
            })}
          />
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Receipt highlights, shop name, etc."
              {...registerService("notes")}
            />
          </div>
          {Object.keys(serviceErrors).length > 0 &&
            renderErrors(serviceErrors as Record<string, { message?: string }>)}

          <button
            type="submit"
            disabled={isSubmittingService}
            className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            {isSubmittingService ? "Saving..." : "Add service record"}
          </button>
        </form>
      )}

      {activeTab === "task" && (
        <form className="space-y-4" onSubmit={onSubmitTask}>
          <SelectField
            label="Vehicle"
            options={vehicleOptions}
            {...registerTask("vehicleId")}
          />
          <TextField
            label="Maintenance item"
            placeholder="Brake inspection"
            {...registerTask("title")}
          />
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Why this matters, parts to check, etc."
              {...registerTask("description")}
            />
          </div>
          <NumberField
          label="Interval (km)"
          placeholder="15000"
          {...registerTask("intervalMiles", {
            setValueAs: (value) =>
              value === "" ? undefined : Number(value)
          })}
          />
          <NumberField
            label="Interval (months)"
            placeholder="6"
            {...registerTask("intervalMonths", {
              setValueAs: (value) =>
                value === "" ? undefined : Number(value)
            })}
          />
          <NumberField
          label="Next due kilometres"
          placeholder="15000"
          {...registerTask("nextDueKilometres", {
            setValueAs: (value) =>
              value === "" ? undefined : Number(value)
          })}
          />
          <DateField
            label="Next due date"
            {...registerTask("nextDueDate", {
              setValueAs: (value: string) =>
                value ? new Date(value) : undefined
            })}
          />
          {Object.keys(taskErrors).length > 0 &&
            renderErrors(taskErrors as Record<string, { message?: string }>)}

          <button
            type="submit"
            disabled={isSubmittingTask}
            className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            {isSubmittingTask ? "Saving..." : "Schedule reminder"}
          </button>
        </form>
      )}
    </aside>
  );
}

type SelectFieldProps = {
  label: string;
  options: { label: string; value: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>;

function SelectField({ label, options, ...props }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-400">
        {label}
      </label>
      <select {...props}>
        <option value="">Select vehicle</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type TextFieldProps = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function TextField({ label, ...props }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-400">
        {label}
      </label>
      <input type="text" {...props} />
    </div>
  );
}

type NumberFieldProps = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function NumberField({ label, ...props }: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-400">
        {label}
      </label>
      <input type="number" {...props} />
    </div>
  );
}

type DateFieldProps = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function DateField({ label, ...props }: DateFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-400">
        {label}
      </label>
      <input type="date" {...props} />
    </div>
  );
}
