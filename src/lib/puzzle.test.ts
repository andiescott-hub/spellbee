import { describe, expect, it } from 'vitest';
import { allPuzzles, parsePuzzle, puzzleForDay, puzzleOrder } from './puzzle';
import { isPangram } from './score';

const COUNT = 1181;

describe('puzzle data', () => {
  const puzzles = allPuzzles();

  it('has every archived NYT puzzle once', () => {
    expect(puzzles).toHaveLength(COUNT);
    expect(new Set(puzzles.map((p) => p.center + p.outer.join(''))).size).toBe(COUNT);
  });

  it('only has puzzles that follow NYT rules', () => {
    for (const p of puzzles) {
      const letters = new Set([p.center, ...p.outer]);
      expect(letters.size).toBe(7);
      expect(p.outer).toEqual([...p.outer].sort());
      expect(p.answers).toEqual([...new Set(p.answers)].sort());
      expect(p.pangrams.length).toBeGreaterThan(0);
      for (const w of p.answers) {
        expect(w.length).toBeGreaterThanOrEqual(4);
        expect(w).toContain(p.center);
        expect([...w].every((c) => letters.has(c))).toBe(true);
      }
    }
  });

  it('parses the answers and totals the points', () => {
    const p = parsePuzzle('p acehit apathetic cape chapati heap pathetic');
    expect(p.center).toBe('p');
    expect(p.outer).toEqual(['a', 'c', 'e', 'h', 'i', 't']);
    expect(p.pangrams).toEqual(['apathetic', 'chapati', 'pathetic'].filter(isPangram));
    // apathetic 9+7, cape 1, chapati 7, heap 1, pathetic 8+7
    expect(p.totalPoints).toBe(16 + 1 + 7 + 1 + 15);
  });
});

describe('puzzleForDay', () => {
  it('uses every puzzle once in a fixed order', () => {
    expect(puzzleOrder()).toHaveLength(COUNT);
    expect(new Set(puzzleOrder()).size).toBe(COUNT);
  });

  it('never repeats within 1,181 consecutive days', () => {
    const seen = new Set<string>();
    for (let day = 3083; day < 3083 + COUNT; day++) {
      const p = puzzleForDay(day);
      seen.add(p.center + p.outer.join(''));
    }
    expect(seen.size).toBe(COUNT);
  });

  it('is the same puzzle for the same day', () => {
    expect(puzzleForDay(3083)).toEqual(puzzleForDay(3083));
    expect(puzzleForDay(3083)).toEqual(puzzleForDay(3083 + COUNT));
    expect(puzzleForDay(3083)).not.toEqual(puzzleForDay(3084));
  });
});
