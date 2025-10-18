type MaintenanceTemplate = {
  title: string;
  description: string;
  intervalMiles: number | null;
  intervalMonths: number | null;
};

const templates: MaintenanceTemplate[] = [
  {
    title: "Oil & filter change",
    description: "Routine engine protection with fresh oil and filter swap.",
    intervalMiles: 5000,
    intervalMonths: 6
  },
  {
    title: "Cabin air filter",
    description: "Replace cabin filter to keep interior air quality high.",
    intervalMiles: 15000,
    intervalMonths: 18
  },
  {
    title: "Brake inspection",
    description: "Check pads, rotors, and fluid for safe stopping.",
    intervalMiles: 10000,
    intervalMonths: 12
  },
  {
    title: "Tire rotation",
    description: "Rotate tires to even out wear and extend tire life.",
    intervalMiles: 6000,
    intervalMonths: 6
  },
  {
    title: "Comprehensive inspection",
    description: "Multi-point inspection covering fluids, belts, and diagnostics.",
    intervalMiles: 20000,
    intervalMonths: 24
  }
];

export function generateDefaultTasks(baseMileage: number | null | undefined) {
  return templates.map((template) => ({
    title: template.title,
    description: template.description,
    interval_miles: template.intervalMiles,
    interval_months: template.intervalMonths,
    next_due_mileage:
      baseMileage && template.intervalMiles
        ? baseMileage + template.intervalMiles
        : null,
    next_due_date: template.intervalMonths
      ? new Date(
          Date.now() + template.intervalMonths * 30 * 24 * 60 * 60 * 1000
        ).toISOString()
      : null,
    status: "upcoming" as const
  }));
}
