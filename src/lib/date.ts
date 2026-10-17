const DAY_MS = 86_400_000;

// Spelling Bee first ran on nytimes.com on 9 May 2018. Days are counted from then.
const EPOCH_UTC = Date.UTC(2018, 4, 9);

/**
 * Index of the puzzle for the given moment in the player's local time zone.
 * Uses the local calendar date with UTC arithmetic so DST changes never shift the count.
 */
export function dayIndex(date: Date = new Date()): number {
  const localMidnightUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((localMidnightUtc - EPOCH_UTC) / DAY_MS);
}

/** Milliseconds from `date` until the next local midnight, when the puzzle changes. */
export function msUntilNextDay(date: Date = new Date()): number {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return next.getTime() - date.getTime();
}

/** Formats a duration as HH:MM:SS for the "Next puzzle" countdown. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/** The calendar date of a puzzle day, e.g. "Saturday, October 17, 2026". */
export function formatDay(day: number, weekday = true): string {
  return new Date(EPOCH_UTC + day * DAY_MS).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: weekday ? 'long' : undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
