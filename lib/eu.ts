const EU_COUNTRIES = [
  "DE",
  "FR",
  "ES",
  "IT",
  "UK",
  "AT",
  "NL",
  "BE",
  "SE",
  "PL"
] as const;

const numberFormatter = new Intl.NumberFormat("de-DE");
const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2
});

export type EuCountry = (typeof EU_COUNTRIES)[number];

export const EU = {
  COUNTRIES: EU_COUNTRIES,
  formatKm(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "-";
    }
    return `${numberFormatter.format(Math.round(value))} km`;
  },
  formatEUR(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "€0.00";
    }
    return currencyFormatter.format(value);
  },
  formatDateEU(date: Date | string | null | undefined) {
    if (!date) return "-";
    const dt = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(dt.getTime())) return "-";
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    return `${day}.${month}.${year}`;
  }
};
