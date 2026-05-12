/**
 * Exchange rate utilities for budget normalization.
 *
 * Tries to fetch live rates from server, falls back to static values if unavailable.
 * All rates: 1 unit of the currency = N USD.
 */

import { BACKEND_URL } from "@/constants/constants";

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

// In-memory cache for live rates (reset on page navigation)
let liveRatesCache: { rates: Record<string, number>; updatedAt: string } | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function fetchLiveRates(): Promise<{ rates: Record<string, number>; updatedAt: string } | null> {
  const now = Date.now();

  // Return cached if still valid
  if (liveRatesCache && now - lastFetchTime < CACHE_DURATION) {
    return liveRatesCache;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BACKEND_URL}/currency/rates?base=USD`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    liveRatesCache = {
      rates: data.rates || {},
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    lastFetchTime = now;
    return liveRatesCache;
  } catch {
    return null;
  }
}

export async function getLiveRates(): Promise<{ rates: Record<string, number>; updatedAt: string; isLive: boolean }> {
  const live = await fetchLiveRates();

  if (live) {
    return {
      rates: live.rates,
      updatedAt: live.updatedAt,
      isLive: true,
    };
  }

  return {
    rates: FALLBACK_RATES_TO_USD,
    updatedAt: "Using fallback rates",
    isLive: false,
  };
}

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

/** Whether rates are live - now dynamic based on fetch success */
export async function checkRatesLive(): Promise<boolean> {
  const result = await getLiveRates();
  return result.isLive;
}

// For backward compatibility - keep as false initially, actual check happens async
export const RATES_ARE_LIVE = false;
