export interface TuitionRange {
  currency: string;
  min: number;
  max: number;
  symbol: string;
  note?: string;
}

export const TYPICAL_TUITION: Record<string, TuitionRange> = {
  "United States":  { currency: "USD", min: 20000, max: 55000, symbol: "$" },
  "United Kingdom": { currency: "GBP", min: 12000, max: 38000, symbol: "£" },
  "Canada":         { currency: "CAD", min: 15000, max: 35000, symbol: "CA$" },
  "Australia":      { currency: "AUD", min: 20000, max: 45000, symbol: "A$" },
  "Germany":        { currency: "EUR", min: 0,     max: 3000,  symbol: "€", note: "Tuition-free at most public universities" },
  "Netherlands":    { currency: "EUR", min: 8000,  max: 20000, symbol: "€" },
  "France":         { currency: "EUR", min: 3000,  max: 15000, symbol: "€" },
  "Sweden":         { currency: "SEK", min: 80000, max: 180000, symbol: "kr" },
  "Norway":         { currency: "NOK", min: 0,     max: 2000,  symbol: "kr", note: "Public universities are tuition-free" },
  "New Zealand":    { currency: "NZD", min: 22000, max: 40000, symbol: "NZ$" },
  "Singapore":      { currency: "SGD", min: 20000, max: 40000, symbol: "S$" },
  "Ireland":        { currency: "EUR", min: 10000, max: 25000, symbol: "€" },
  "Japan":          { currency: "JPY", min: 500000, max: 1500000, symbol: "¥" },
  "South Korea":    { currency: "KRW", min: 3000000, max: 10000000, symbol: "₩" },
};
