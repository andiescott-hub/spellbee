import type { Puzzle } from './puzzle';
import { GENIUS, QUEEN_BEE, isPangram, rankIndex, totalScore } from './score';

/** What one day's play adds to the stats. */
export interface DayRecord {
  words: number;
  pangrams: number;
  points: number;
  /** Highest rank reached, as an index into RANKS. */
  rank: number;
  longest: string;
}

/** Numbers carried over from NYT. */
export interface ImportedStats {
  played: number;
  words: number;
  pangrams: number;
  genius: number;
  queenBee: number;
  longest: string;
  /** Last puzzle day the numbers cover. Days up to it played here are not added on top. */
  throughDay: number;
}

export interface StatsStore {
  /** Keyed by puzzle day. A day is only recorded once a word has been found. */
  days: Record<string, DayRecord>;
  imported: ImportedStats | null;
}

export const EMPTY_STORE: StatsStore = { days: {}, imported: null };

export interface Stats {
  played: number;
  words: number;
  pangrams: number;
  /** Puzzles that reached Genius, including those that went on to Queen Bee. */
  genius: number;
  queenBee: number;
  longest: string;
}

/** The longer of two words, keeping the first on a tie. */
function longer(a: string, b: string): string {
  return b.length > a.length ? b : a;
}

export function dayRecord(puzzle: Puzzle, found: string[]): DayRecord {
  const points = totalScore(found);
  return {
    words: found.length,
    pangrams: found.filter(isPangram).length,
    points,
    rank: rankIndex(points, puzzle.totalPoints),
    longest: found.reduce(longer, ''),
  };
}

export function recordDay(store: StatsStore, day: number, record: DayRecord): StatsStore {
  if (record.words === 0) return store;
  return { ...store, days: { ...store.days, [day]: record } };
}

export function computeStats(store: StatsStore): Stats {
  const imported = store.imported;
  const stats: Stats = imported
    ? {
        played: imported.played,
        words: imported.words,
        pangrams: imported.pangrams,
        genius: imported.genius,
        queenBee: imported.queenBee,
        longest: imported.longest,
      }
    : { played: 0, words: 0, pangrams: 0, genius: 0, queenBee: 0, longest: '' };

  for (const [day, r] of Object.entries(store.days)) {
    if (imported && Number(day) <= imported.throughDay) continue;
    stats.played += 1;
    stats.words += r.words;
    stats.pangrams += r.pangrams;
    if (r.rank >= GENIUS) stats.genius += 1;
    if (r.rank === QUEEN_BEE) stats.queenBee += 1;
    stats.longest = longer(stats.longest, r.longest);
  }
  return stats;
}

export interface ImportInput {
  played: number;
  words: number;
  pangrams: number;
  genius: number;
  queenBee: number;
  longest: string;
  /** True if the numbers already include today's puzzle. */
  includesToday: boolean;
}

export function validateImport(input: ImportInput): string | null {
  const numbers = [input.played, input.words, input.pangrams, input.genius, input.queenBee];
  if (numbers.some((n) => !Number.isInteger(n) || n < 0)) return 'Use whole numbers of 0 or more';
  if (input.pangrams > input.words) return 'Pangrams found cannot be more than Words found';
  if (input.genius > input.played) return 'Genius cannot be more than Puzzles played';
  if (input.queenBee > input.genius) return 'Queen Bee cannot be more than Genius';
  if (!/^[a-z]*$/i.test(input.longest.trim())) return 'Longest word can only contain letters';
  return null;
}

/** Replaces the saved stats with imported numbers. Later days played here add to them. */
export function importStats(store: StatsStore, input: ImportInput, today: number): StatsStore {
  return {
    ...store,
    imported: {
      played: input.played,
      words: input.words,
      pangrams: input.pangrams,
      genius: input.genius,
      queenBee: input.queenBee,
      longest: input.longest.trim().toLowerCase(),
      throughDay: input.includesToday ? today : today - 1,
    },
  };
}
