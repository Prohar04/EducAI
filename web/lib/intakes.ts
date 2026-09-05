/**
 * Intake options were hardcoded, so the list silently rotted — "Fall 2025" was
 * still selectable a year after it started. Derive them from the current date
 * instead, so the dropdown can never offer an intake nobody can apply to.
 *
 * Fall ≈ September, Spring ≈ January of the labelled year.
 */
export type Intake = { label: string; startsAt: Date };

const FALL_MONTH = 8; // September (0-indexed)
const SPRING_MONTH = 0; // January

function intakesFrom(year: number): Intake[] {
  return [
    { label: `Spring ${year}`, startsAt: new Date(year, SPRING_MONTH, 1) },
    { label: `Fall ${year}`, startsAt: new Date(year, FALL_MONTH, 1) },
  ];
}

/**
 * The next `count` intakes whose application window is still open, oldest first.
 * An intake stays listed until its start month has passed, so someone applying
 * late in the cycle still sees it.
 */
export function upcomingIntakes(count = 6, now: Date = new Date()): string[] {
  const year = now.getFullYear();
  const all = [year, year + 1, year + 2, year + 3].flatMap(intakesFrom);
  return all
    .filter((i) => i.startsAt >= new Date(now.getFullYear(), now.getMonth(), 1))
    .slice(0, count)
    .map((i) => i.label);
}
