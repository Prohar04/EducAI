const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "AU$",
  SGD: "S$",
};

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return amount.toLocaleString("en-US");
}

export function formatSalary(
  min?: number,
  max?: number,
  currency = "USD"
): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  if (min !== undefined && max !== undefined) {
    return `${sym}${formatAmount(min)} – ${sym}${formatAmount(max)}`;
  }
  if (min !== undefined) return `${sym}${formatAmount(min)}+`;
  if (max !== undefined) return `Up to ${sym}${formatAmount(max)}`;
  return "Salary not specified";
}
