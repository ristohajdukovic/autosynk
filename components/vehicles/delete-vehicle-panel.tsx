"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type DeleteVehiclePanelProps = {
  vehicleId: string;
  vehicleName: string;
};

export function DeleteVehiclePanel({
  vehicleId,
  vehicleName
}: DeleteVehiclePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete ${vehicleName}? This removes the vehicle, reminders, odometer entries, and service records. This action cannot be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: "DELETE"
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Delete failed");
        }
        toast.success("Vehicle deleted");
        router.replace("/dashboard");
        router.refresh();
      } catch (error) {
        toast.error("Unable to delete vehicle", {
          description:
            error instanceof Error ? error.message : "Please try again later."
        });
      }
    });
  };

  return (
    <div className="card flex h-full flex-col gap-4 border border-danger/30 bg-danger/5 p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-danger">Danger zone</h2>
        <p className="text-sm text-danger/80">
          Deleting this vehicle removes all associated records. There is no
          undo.
        </p>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="w-full rounded-lg border border-danger/60 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete vehicle"}
      </button>
    </div>
  );
}
