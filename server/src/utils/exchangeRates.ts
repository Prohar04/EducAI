/**
 * Exchange rate utilities for budget normalization.
 *
 * Rates are STATIC FALLBACK values (approximate, sourced circa early 2026).
 * All rates are expressed as: 1 unit of the given currency = N USD.
 *
 * These are intentionally conservative mid-market approximations.
 * To integrate live rates later, replace `FALLBACK_RATES_TO_USD` with a
 * live-rate fetch (e.g. Open Exchange Rates, Fixer.io) and cache per-hour.
 *
 * NOTE: Displayed values derived from these rates should be labeled
 * "~" or "approx." in the UI since they are static fallbacks.
 */

export const FALLBACK_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.09,
  GBP: 1.27,
  CAD: 0.73,
  AUD: 0.65,
  SGD: 0.74,
  INR: 0.012,
  BDT: 0.0083,
  SEK: 0.096,
};

/**
 * Convert an amount from any supported currency to USD.
 * Returns null if the currency is unknown.
 */
export function toUSD(amount: number, currency: string): number | null {
  const rate = FALLBACK_RATES_TO_USD[currency.toUpperCase()];
  if (rate == null) return null;
  return Math.round(amount * rate);
}

/**
 * Convert an amount from USD to another currency.
 * Returns null if the currency is unknown.
 */
export function fromUSD(usdAmount: number, targetCurrency: string): number | null {
  const rate = FALLBACK_RATES_TO_USD[targetCurrency.toUpperCase()];
  if (rate == null) return null;
  return Math.round(usdAmount / rate);
}

/**
 * Convert between two arbitrary currencies via USD as the pivot.
 * Returns null if either currency is unknown.
 */
export function convert(amount: number, fromCurrency: string, toCurrency: string): number | null {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) return Math.round(amount);
  const usd = toUSD(amount, fromCurrency);
  if (usd == null) return null;
  return fromUSD(usd, toCurrency);
}

/** Whether rates are live (false = static fallback). */
export const RATES_ARE_LIVE = false;
