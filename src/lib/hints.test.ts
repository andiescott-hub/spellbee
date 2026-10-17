import { describe, expect, it } from 'vitest';
import { hintGrid, hintSummary, twoLetterList } from './hints';

// The 17 October 2024 NYT puzzle (center P; A C E H I T).
const ANSWERS =
  'accept apace apathetic apiece appetite cape captcha chap chapati cheap cheapie cheep chip epee epic epitaph epithet haptic heap hepatic hepcat hippie ipecac pace pact papa patch pate path pathetic peace peach peat peep pepita peptic petit petite phat pica piccata piece pipe pipet pipette pipit pita pitapat pitch pith tapa tape teepee tepee tipi tippet'.split(' ');

describe('hintSummary', () => {
  it('matches the NYT hints header', () => {
    expect(hintSummary(ANSWERS)).toEqual({ words: 56, points: 256, pangrams: 3, perfect: 1, bingo: true });
  });

  it('has no bingo when a letter starts no word', () => {
    expect(hintSummary(['pace', 'peach']).bingo).toBe(false);
  });
});

describe('hintGrid', () => {
  const grid = hintGrid(ANSWERS);

  it('counts words by first letter and length', () => {
    expect(grid.lengths).toEqual([4, 5, 6, 7, 8, 9]);
    expect(grid.rows.map((r) => r.letter)).toEqual(['a', 'c', 'e', 'h', 'i', 'p', 't']);
    expect(grid.rows.find((r) => r.letter === 'h')).toEqual({ letter: 'h', counts: [1, 0, 3, 1, 0, 0], total: 5 });
    expect(grid.total).toBe(56);
    expect(grid.totals.reduce((a, b) => a + b, 0)).toBe(56);
  });

  it('keeps its shape while counting only the words left', () => {
    const left = hintGrid(ANSWERS, ANSWERS.filter((w) => w[0] !== 'h'));
    expect(left.lengths).toEqual(grid.lengths);
    expect(left.rows.find((r) => r.letter === 'h')).toEqual({ letter: 'h', counts: [0, 0, 0, 0, 0, 0], total: 0 });
    expect(left.total).toBe(51);
  });
});

describe('twoLetterList', () => {
  it('groups opening pairs by first letter', () => {
    const list = twoLetterList(ANSWERS);
    expect(list.map((g) => g.map((p) => `${p.prefix}-${p.count}`).join(' '))).toEqual([
      'ac-1 ap-4',
      'ca-2 ch-6',
      'ep-4',
      'ha-1 he-3 hi-1',
      'ip-1',
      'pa-7 pe-8 ph-1 pi-11',
      'ta-2 te-2 ti-2',
    ]);
  });

  it('counts only the words left, keeping found pairs at 0', () => {
    const list = twoLetterList(ANSWERS, ['accept']);
    expect(list[0]).toEqual([
      { prefix: 'ac', count: 1 },
      { prefix: 'ap', count: 0 },
    ]);
  });
});
