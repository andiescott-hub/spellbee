import { describe, expect, it } from 'vitest';
import { parsePuzzle } from './puzzle';
import { GENIUS, QUEEN_BEE } from './score';
import { EMPTY_STORE, computeStats, dayRecord, importStats, recordDay, validateImport } from './stats';

// 1 + 5 + 7 + 15 = 28 points. Amazing needs 14, Genius 20, Queen Bee 28.
const puzzle = parsePuzzle('p acehit cape chapati pathetic peach');

describe('dayRecord', () => {
  it('sums a day of found words', () => {
    expect(dayRecord(puzzle, ['cape', 'pathetic'])).toEqual({ words: 2, pangrams: 1, points: 16, rank: 7, longest: 'pathetic' });
    expect(dayRecord(puzzle, ['cape', 'chapati', 'pathetic']).rank).toBe(GENIUS);
    expect(dayRecord(puzzle, puzzle.answers).rank).toBe(QUEEN_BEE);
  });
});

describe('computeStats', () => {
  it('starts empty', () => {
    expect(computeStats(EMPTY_STORE)).toEqual({ played: 0, words: 0, pangrams: 0, genius: 0, queenBee: 0, longest: '' });
  });

  it('adds up the days played, counting each day once however many words are found', () => {
    let store = recordDay(EMPTY_STORE, 100, dayRecord(puzzle, ['cape']));
    store = recordDay(store, 100, dayRecord(puzzle, ['cape', 'chapati', 'pathetic']));
    store = recordDay(store, 101, dayRecord(puzzle, puzzle.answers));
    expect(computeStats(store)).toEqual({ played: 2, words: 7, pangrams: 2, genius: 2, queenBee: 1, longest: 'pathetic' });
  });

  it('does not count a day with no words', () => {
    expect(recordDay(EMPTY_STORE, 100, dayRecord(puzzle, []))).toBe(EMPTY_STORE);
  });
});

describe('import', () => {
  const nyt = { played: 412, words: 13250, pangrams: 520, genius: 200, queenBee: 31, longest: 'Nationalization' };

  it('includes today: today here is not added, tomorrow is', () => {
    let store = importStats(EMPTY_STORE, { ...nyt, includesToday: true }, 100);
    store = recordDay(store, 100, dayRecord(puzzle, ['cape']));
    expect(computeStats(store)).toEqual({ ...nyt, longest: 'nationalization' });
    store = recordDay(store, 101, dayRecord(puzzle, ['cape', 'chapati', 'pathetic']));
    expect(computeStats(store)).toMatchObject({ played: 413, words: 13253, pangrams: 521, genius: 201, queenBee: 31 });
  });

  it('excludes today: today here is added on top', () => {
    let store = importStats(EMPTY_STORE, { ...nyt, includesToday: false }, 100);
    store = recordDay(store, 100, dayRecord(puzzle, ['cape']));
    expect(computeStats(store)).toMatchObject({ played: 413, words: 13251 });
  });

  it('replaces days played here before the import', () => {
    let store = recordDay(EMPTY_STORE, 99, dayRecord(puzzle, ['cape']));
    store = importStats(store, { ...nyt, includesToday: true }, 100);
    expect(computeStats(store).played).toBe(412);
  });

  it('rejects impossible numbers', () => {
    expect(validateImport({ ...nyt, includesToday: true })).toBeNull();
    expect(validateImport({ ...nyt, played: 1.5, includesToday: true })).toMatch(/whole numbers/);
    expect(validateImport({ ...nyt, pangrams: 20000, includesToday: true })).toMatch(/Words found/);
    expect(validateImport({ ...nyt, genius: 500, includesToday: true })).toMatch(/Puzzles played/);
    expect(validateImport({ ...nyt, queenBee: 201, includesToday: true })).toMatch(/Queen Bee/);
    expect(validateImport({ ...nyt, longest: 'two words', includesToday: true })).toMatch(/letters/);
  });
});
