import { isPangram, totalScore } from './score';

export interface HintSummary {
  words: number;
  points: number;
  pangrams: number;
  /** Pangrams that use each letter exactly once. */
  perfect: number;
  /** Every one of the 7 letters starts at least one word. */
  bingo: boolean;
}

export function hintSummary(words: string[]): HintSummary {
  const pangrams = words.filter(isPangram);
  return {
    words: words.length,
    points: totalScore(words),
    pangrams: pangrams.length,
    perfect: pangrams.filter((w) => w.length === 7).length,
    bingo: new Set(words.map((w) => w[0])).size === 7,
  };
}

export interface HintGrid {
  /** Word lengths with at least one answer, shortest first. */
  lengths: number[];
  /** One row per starting letter, alphabetical. */
  rows: { letter: string; counts: number[]; total: number }[];
  /** Column totals, by length. */
  totals: number[];
  total: number;
}

/**
 * The NYT "Spelling Bee Grid": how many words start with each letter, by length.
 * Its shape comes from all the answers; the counts come from `counted`, so passing only the words
 * still to find gives the same grid with what's left.
 */
export function hintGrid(answers: string[], counted: string[] = answers): HintGrid {
  const lengths = [...new Set(answers.map((w) => w.length))].sort((a, b) => a - b);
  const letters = [...new Set(answers.map((w) => w[0]))].sort();
  const rows = letters.map((letter) => {
    const counts = lengths.map((n) => counted.filter((w) => w[0] === letter && w.length === n).length);
    return { letter, counts, total: counts.reduce((a, b) => a + b, 0) };
  });
  const totals = lengths.map((_, i) => rows.reduce((sum, r) => sum + r.counts[i], 0));
  return { lengths, rows, totals, total: totals.reduce((a, b) => a + b, 0) };
}

/** The NYT "Two-Letter List": words per opening pair, grouped by first letter. */
export function twoLetterList(answers: string[], counted: string[] = answers): { prefix: string; count: number }[][] {
  const prefixes = [...new Set(answers.map((w) => w.slice(0, 2)))].sort();
  const groups = new Map<string, { prefix: string; count: number }[]>();
  for (const prefix of prefixes) {
    const count = counted.filter((w) => w.startsWith(prefix)).length;
    const group = groups.get(prefix[0]) ?? [];
    group.push({ prefix, count });
    groups.set(prefix[0], group);
  }
  return [...groups.values()];
}
