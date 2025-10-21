type FuelInferenceInput = {
  make: string;
  model: string;
  vin?: string | null;
};

export function inferFuelType(values: FuelInferenceInput) {
  const make = values.make.toLowerCase();
  const model = values.model.toLowerCase();
  const vin = values.vin?.toUpperCase() ?? "";

  if (make.includes("tesla") || model.includes("tesla")) {
    return "EV";
  }

  if (model.includes("phev") || model.includes("plug-in") || model.includes("ev")) {
    return "EV";
  }

  if (model.includes("diesel") || vin.startsWith("WDB")) {
    return "Diesel";
  }

  if (model.includes("hybrid") || model.includes("hev")) {
    return "HEV";
  }

  return "ICE/HEV";
}
