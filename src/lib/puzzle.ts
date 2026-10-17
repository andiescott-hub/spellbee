import PUZZLES from '../data/puzzles';
import { isPangram, wordScore } from './score';

export interface Puzzle {
  center: string;
  /** The six outer letters, alphabetical, the order NYT first shows them in. */
  outer: string[];
  /** Every accepted word, alphabetical. */
  answers: string[];
  pangrams: string[];
  totalPoints: number;
}

// Fixed seed so every device gets the same puzzle on the same day.
const SEED = 0x42_65_65_21; // "Bee!"

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let lines: string[] | null = null;
let ordered: string[] | null = null;

function allLines(): string[] {
  lines ??= PUZZLES.split('\n');
  return lines;
}

/** The puzzle lines in their fixed daily order (a seeded Fisher-Yates shuffle). */
export function puzzleOrder(): string[] {
  if (ordered) return ordered;
  const list = [...allLines()];
  const random = mulberry32(SEED);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  ordered = list;
  return list;
}

export function parsePuzzle(line: string): Puzzle {
  const [center, outer, ...answers] = line.split(' ');
  return {
    center,
    outer: [...outer],
    answers,
    pangrams: answers.filter(isPangram),
    totalPoints: answers.reduce((sum, w) => sum + wordScore(w), 0),
  };
}

/** The puzzle for a puzzle day. No puzzle repeats within any run of 1,181 consecutive days. */
export function puzzleForDay(day: number): Puzzle {
  const list = puzzleOrder();
  const n = list.length;
  return parsePuzzle(list[((day % n) + n) % n]);
}

export function allPuzzles(): Puzzle[] {
  return allLines().map(parsePuzzle);
}
