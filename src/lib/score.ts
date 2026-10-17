import type { Puzzle } from './puzzle';

export const MIN_LENGTH = 4;
/** Longest input NYT accepts before saying "Too long". */
export const MAX_LENGTH = 19;
export const PANGRAM_BONUS = 7;

/** Puzzle words only use the hive's 7 letters, so one using 7 different letters uses them all. */
export function isPangram(word: string): boolean {
  return new Set(word).size === 7;
}

/** 4-letter words score 1, longer words 1 per letter, and pangrams 7 more. */
export function wordScore(word: string): number {
  const base = word.length === MIN_LENGTH ? 1 : word.length;
  return isPangram(word) ? base + PANGRAM_BONUS : base;
}

export function totalScore(words: string[]): number {
  return words.reduce((sum, w) => sum + wordScore(w), 0);
}

/** NYT's ranks and the share of the puzzle's points each one needs. */
export const RANKS = [
  { name: 'Beginner', percent: 0 },
  { name: 'Good Start', percent: 2 },
  { name: 'Moving Up', percent: 5 },
  { name: 'Good', percent: 8 },
  { name: 'Solid', percent: 15 },
  { name: 'Nice', percent: 25 },
  { name: 'Great', percent: 40 },
  { name: 'Amazing', percent: 50 },
  { name: 'Genius', percent: 70 },
  { name: 'Queen Bee', percent: 100 },
] as const;

export const GENIUS = 8;
export const QUEEN_BEE = 9;

/** Minimum score for each rank, rounded to the nearest point as NYT does. */
export function rankThresholds(totalPoints: number): number[] {
  return RANKS.map((r) => Math.round((r.percent / 100) * totalPoints));
}

export function rankIndex(score: number, totalPoints: number): number {
  const thresholds = rankThresholds(totalPoints);
  let rank = 0;
  for (let i = 0; i < thresholds.length; i++) if (score >= thresholds[i]) rank = i;
  return rank;
}

/** The toast for an accepted word. */
export function successMessage(word: string): string {
  if (isPangram(word)) return 'Pangram!';
  if (word.length === MIN_LENGTH) return 'Good!';
  if (word.length <= 6) return 'Nice!';
  return 'Awesome!';
}

/** NYT's message for a rejected word, or null if the word scores. */
export function rejection(word: string, puzzle: Puzzle, found: ReadonlySet<string>): string | null {
  if (word.length < MIN_LENGTH) return 'Too short';
  if (word.length > MAX_LENGTH) return 'Too long';
  const letters = new Set([puzzle.center, ...puzzle.outer]);
  if (![...word].every((c) => letters.has(c))) return 'Bad letters';
  if (!word.includes(puzzle.center)) return 'Missing center letter';
  if (found.has(word)) return 'Already found';
  if (!puzzle.answers.includes(word)) return 'Not in word list';
  return null;
}
