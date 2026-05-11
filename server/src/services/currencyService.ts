interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
}

let _cache: ExchangeRates | null = null;
let _cacheTime = 0;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function getExchangeRates(base = "USD"): Promise<ExchangeRates> {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL && _cache.base === base) {
    return _cache;
  }

  const res = await fetch(
    `https://open.er-api.com/v6/latest/${base}`,
    { signal: AbortSignal.timeout(10000) },
  );

  if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`);

  const data = await res.json();
  _cache = {
    base,
    rates: data.rates,
    updatedAt: new Date().toISOString(),
  };
  _cacheTime = now;
  return _cache;
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<{ converted: number; rate: number; updatedAt: string }> {
  const rates = await getExchangeRates("USD");
  const fromRate = rates.rates[from.toUpperCase()] ?? 1;
  const toRate = rates.rates[to.toUpperCase()] ?? 1;
  const rate = toRate / fromRate;
  return {
    converted: Math.round(amount * rate * 100) / 100,
    rate,
    updatedAt: rates.updatedAt,
  };
}
