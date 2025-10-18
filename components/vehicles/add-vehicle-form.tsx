"use client";

import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { generateDefaultTasks } from "@/lib/maintenance-templates";
import type { Database } from "@/types/database";

const vehicleSchema = z.object({
  make: z.string().min(2, "Enter the vehicle make"),
  model: z.string().min(1, "Enter the vehicle model"),
  year: z.coerce
    .number({
      invalid_type_error: "Year must be a 4 digit number"
    })
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .optional()
    .nullable(),
  nickname: z
    .string()
    .max(60, "Nickname is too long")
    .optional()
    .nullable(),
  vin: z
    .string()
    .max(17, "VIN must be 17 characters")
    .optional()
    .nullable(),
  baseMileage: z.coerce
    .number({
      invalid_type_error: "Mileage must be a number"
    })
    .min(0)
    .optional()
    .nullable()
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

type AddVehicleFormProps = {
  userId: string;
};

export function AddVehicleForm({ userId }: AddVehicleFormProps) {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema)
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      let photoUrl: string | null = null;

      if (vehiclePhoto) {
        const path = `${userId}/vehicles/${Date.now()}-${vehiclePhoto.name}`;
        const { error: uploadError } = await supabase.storage
          .from("vehicle-photos")
          .upload(path, vehiclePhoto, {
            cacheControl: "3600",
            upsert: false
          });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("vehicle-photos")
          .getPublicUrl(path);
        photoUrl = data.publicUrl;
      }

      const { data: vehicle, error } = await supabase
        .from("vehicles")
        .insert({
          user_id: userId,
          make: values.make,
          model: values.model,
          year: values.year ?? null,
          nickname: values.nickname ?? null,
          vin: values.vin ? values.vin.toUpperCase() : null,
          base_mileage: values.baseMileage ?? null,
          photo_url: photoUrl
        })
        .select("id, base_mileage")
        .single();

      if (error) throw error;

      const defaultTasks = generateDefaultTasks(vehicle.base_mileage ?? null);

      if (defaultTasks.length) {
        const { error: tasksError } = await supabase
          .from("maintenance_tasks")
          .insert(
            defaultTasks.map((task) => ({
              ...task,
              vehicle_id: vehicle.id,
              created_by: userId
            }))
          );
        if (tasksError) {
          throw tasksError;
        }
      }

      toast.success("Vehicle added to your garage");
      reset();
      setVehiclePhoto(null);
      router.push(`/vehicles/${vehicle.id}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add vehicle";
      toast.error("Vehicle setup failed", { description: message });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Make" error={errors.make?.message}>
          <input placeholder="Tesla" {...register("make")} />
        </Field>
        <Field label="Model" error={errors.model?.message}>
          <input placeholder="Model 3" {...register("model")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Year" error={errors.year?.message ?? undefined}>
          <input
            type="number"
            placeholder="2022"
            {...register("year", {
              setValueAs: (value: string) =>
                value === "" ? null : Number(value)
            })}
          />
        </Field>
        <Field label="Nickname" error={errors.nickname?.message ?? undefined}>
          <input placeholder="Daily Driver" {...register("nickname")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="VIN" error={errors.vin?.message ?? undefined}>
          <input placeholder="1HGCM82633A004352" {...register("vin")} />
        </Field>
        <Field
          label="Current mileage"
          error={errors.baseMileage?.message ?? undefined}
        >
          <input
            type="number"
            placeholder="124500"
            {...register("baseMileage", {
              setValueAs: (value: string) =>
                value === "" ? null : Number(value)
            })}
          />
        </Field>
      </div>

      <Field label="Vehicle photo">
        <input
          type="file"
          accept="image/*"
          onChange={(event) =>
            setVehiclePhoto(event.currentTarget.files?.[0] ?? null)
          }
        />
      </Field>

      <p className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 text-xs text-slate-400">
        We&apos;ll auto-generate a starter maintenance schedule after adding
        your vehicle. You can customize intervals any time.
      </p>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Add vehicle"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
