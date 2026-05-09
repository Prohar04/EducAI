export function isLowEndDevice(): boolean {
  if (typeof window === "undefined") return false

  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean }
  }).connection

  if (connection?.saveData) return true
  if (connection?.effectiveType === "slow-2g") return true
  if (connection?.effectiveType === "2g") return true

  const memory = (performance as Performance & {
    memory?: { jsHeapSizeLimit?: number }
  }).memory

  if (memory && memory.jsHeapSizeLimit !== undefined && memory.jsHeapSizeLimit < 536870912) return true

  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true

  return false
}

export function prefersReducedData(): boolean {
  if (typeof window === "undefined") return false
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean }
  }).connection
  return connection?.saveData === true
}
