type SeedVehicleTasksArgs = {
  vehicleId: string;
  make: string;
  model: string;
  fuel?: string | null;
};

export async function seedVehicleTasks({
  vehicleId,
  make,
  model,
  fuel
}: SeedVehicleTasksArgs) {
  try {
    const response = await fetch(`/api/vehicles/${vehicleId}/seed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        make: make.trim(),
        model: model.trim(),
        fuel: fuel?.trim()
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? "Unable to seed maintenance tasks");
    }

    return (await response.json()) as { inserted: number };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unable to seed maintenance tasks");
  }
}
