"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Database } from "@/types/database";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { seedVehicleTasks } from "@/lib/vehicles/seed-tasks";
import { inferFuelType } from "@/lib/vehicles/infer-fuel";
import { EU } from "@/lib/eu";

const vehicleSchema = z.object({
  make: z.string().min(2, "Select or enter the vehicle make"),
  model: z.string().min(1, "Select or enter the vehicle model"),
  fuel: z.string().max(30, "Fuel type must be under 30 characters").optional().nullable(),
  countryCode: z.string().length(2, "Select a registration country"),
  firstRegDate: z.string().min(4, "Provide the first registration date"),
  lastPassDate: z.string().optional().nullable(),
  year: z
    .coerce.number({
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
  baseMileage: z
    .coerce.number({
      invalid_type_error: "Odometer must be a number"
    })
    .min(0)
    .optional()
    .nullable()
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

type AddVehicleFormProps = {
  userId: string;
};

type TemplateOption = {
  make: string;
  model: string;
  fuel: string;
};

type CountryOption = {
  code: string;
  name: string;
};

export function AddVehicleForm({ userId }: AddVehicleFormProps) {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isLoadingTemplates, setLoadingTemplates] = useState(true);
  const [isLoadingCountries, setLoadingCountries] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      fuel: "",
      countryCode: "",
      firstRegDate: new Date().toISOString().slice(0, 10),
      lastPassDate: ""
    }
  });

  const selectedMake = watch("make");
  const selectedModel = watch("model");
  const selectedCountry = watch("countryCode");

  useEffect(() => {
    const load = async () => {
      const [templatesResponse, countriesResponse] = await Promise.all([
        supabase
          .from("maintenance_templates")
          .select("make, model, fuel")
          .order("make", { ascending: true })
          .order("model", { ascending: true }),
        supabase
          .from("eu_countries")
          .select("code, name")
          .order("name", { ascending: true })
      ]);

      if (templatesResponse.error) {
        toast.error("Unable to load vehicle library", {
          description: templatesResponse.error.message
        });
        setTemplates([]);
      } else {
        setTemplates(
          templatesResponse.data?.map((row) => ({
            make: row.make,
            model: row.model,
            fuel: row.fuel ?? "ICE/HEV"
          })) ?? []
        );
      }
      setLoadingTemplates(false);

      if (countriesResponse.error) {
        toast.error("Unable to load EU countries", {
          description: countriesResponse.error.message
        });
        setCountries(
          EU.COUNTRIES.map((code) => ({
            code,
            name: code
          }))
        );
      } else {
        const loaded =
          countriesResponse.data ??
          EU.COUNTRIES.map((code) => ({
            code,
            name: code
          }));
        setCountries(loaded);
      }
      setLoadingCountries(false);
    };

    load();
  }, [supabase]);

  const makeOptions = useMemo(
    () => Array.from(new Set(templates.map((item) => item.make))).sort(),
    [templates]
  );

  const modelOptions = useMemo(() => {
    if (!selectedMake) return [];
    return Array.from(
      new Set(
        templates
          .filter((item) => item.make === selectedMake)
          .map((item) => item.model)
      )
    ).sort();
  }, [templates, selectedMake]);

  const fuelOptions = useMemo(() => {
    if (!selectedMake || !selectedModel) return [];
    return Array.from(
      new Set(
        templates
          .filter(
            (item) =>
              item.make === selectedMake && item.model === selectedModel
          )
          .map((item) => item.fuel)
      )
    );
  }, [templates, selectedMake, selectedModel]);

  useEffect(() => {
    if (!selectedMake && !isLoadingTemplates) {
      setValue("model", "");
      setValue("fuel", "");
      return;
    }

    if (
      selectedMake &&
      selectedModel &&
      !modelOptions.includes(selectedModel)
    ) {
      setValue("model", "");
      setValue("fuel", "");
    }
  }, [selectedMake, selectedModel, isLoadingTemplates, modelOptions, setValue]);

  useEffect(() => {
    if (fuelOptions.length === 1) {
      setValue("fuel", fuelOptions[0]);
    }
  }, [fuelOptions, setValue]);

  useEffect(() => {
    if (!isLoadingCountries && countries.length && !selectedCountry) {
      setValue("countryCode", countries[0].code);
    }
  }, [countries, isLoadingCountries, selectedCountry, setValue]);

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
        .select("id")
        .single();

      if (error) throw error;

      await seedVehicleTasks({
        vehicleId: vehicle.id,
        make: values.make,
        model: values.model,
        fuel:
          values.fuel && values.fuel.trim().length > 0
            ? values.fuel.trim()
            : inferFuelType({
                make: values.make,
                model: values.model,
                vin: values.vin ?? null
              })
      });

      if (values.countryCode && values.firstRegDate) {
        const inspectionResponse = await fetch(
          `/api/vehicles/${vehicle.id}/inspection`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              countryCode: values.countryCode,
              firstRegDate: values.firstRegDate,
              lastPassDate:
                values.lastPassDate && values.lastPassDate.length > 0
                  ? values.lastPassDate
                  : null
            })
          }
        );

        if (!inspectionResponse.ok) {
          const payload = await inspectionResponse.json().catch(() => null);
          toast.error("Unable to schedule inspection", {
            description: payload?.error ?? "Please review the inspection details."
          });
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
          <Input
            placeholder="Select or type make"
            list="vehicle-make-options"
            {...register("make")}
          />
          <datalist id="vehicle-make-options">
            {makeOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>
        <Field label="Model" error={errors.model?.message}>
          <Input
            placeholder="Select or type model"
            list="vehicle-model-options"
            {...register("model")}
          />
          <datalist id="vehicle-model-options">
            {modelOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Fuel (optional)">
          <Input
            placeholder="Select or type fuel"
            list="vehicle-fuel-options"
            {...register("fuel")}
          />
          <datalist id="vehicle-fuel-options">
            {fuelOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>
        <Field label="Year" error={errors.year?.message ?? undefined}>
          <Input
            type="number"
            placeholder="2022"
            {...register("year", {
              setValueAs: (value: string) =>
                value === "" ? null : Number(value)
            })}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nickname" error={errors.nickname?.message ?? undefined}>
          <Input placeholder="Daily Driver" {...register("nickname")} />
        </Field>
        <Field label="VIN" error={errors.vin?.message ?? undefined}>
          <Input placeholder="1HGCM82633A004352" {...register("vin")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Registration country"
          error={errors.countryCode?.message ?? undefined}
        >
          <Select
            {...register("countryCode")}
            className="w-full"
            disabled={isLoadingCountries}
          >
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="First registration date"
          error={errors.firstRegDate?.message ?? undefined}
        >
          <Input type="date" {...register("firstRegDate")} />
        </Field>
      </div>

      <Field label="Last inspection pass (optional)">
        <Input type="date" {...register("lastPassDate")} />
      </Field>

      <Field
        label="Base odometer (km)"
        error={errors.baseMileage?.message ?? undefined}
      >
        <Input
          type="number"
          placeholder="124500"
          {...register("baseMileage", {
            setValueAs: (value: string) =>
              value === "" ? null : Number(value)
          })}
        />
      </Field>

      <Field label="Vehicle photo">
        <Input
          type="file"
          accept="image/*"
          onChange={(event) =>
            setVehiclePhoto(event.currentTarget.files?.[0] ?? null)
          }
        />
      </Field>

      <p className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 text-xs text-slate-400">
        {isLoadingTemplates
          ? "Loading recommended maintenance schedules..."
          : "Select a make and model to auto-load service templates. You can customise reminders at any time."}
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

