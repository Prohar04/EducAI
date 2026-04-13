/**
 * Exchange rate utilities for budget normalization — frontend copy.
 *
 * Rates are STATIC FALLBACK values (approximate, sourced circa early 2026).
 * All rates: 1 unit of the currency = N USD.
 *
 * Keep in sync with server/src/utils/exchangeRates.ts
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

export function toUSD(amount: number, currency: string): number | null {
  const rate = FALLBACK_RATES_TO_USD[currency.toUpperCase()];
  if (rate == null) return null;
  return Math.round(amount * rate);
}

export function fromUSD(usdAmount: number, targetCurrency: string): number | null {
  const rate = FALLBACK_RATES_TO_USD[targetCurrency.toUpperCase()];
  if (rate == null) return null;
  return Math.round(usdAmount / rate);
}

export function convert(amount: number, fromCurrency: string, toCurrency: string): number | null {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) return Math.round(amount);
  const usd = toUSD(amount, fromCurrency);
  if (usd == null) return null;
  return fromUSD(usd, toCurrency);
}

/** Whether rates are live (false = static fallback). */
export const RATES_ARE_LIVE = false;
