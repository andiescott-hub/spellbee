import { describe, expect, it } from 'vitest';
import { shareText } from './share';

describe('shareText', () => {
  it('shares the rank and score without spoilers', () => {
    expect(shareText({ day: 3083, rank: 8, points: 128, words: 42, pangrams: 2 })).toBe(
      'Spelling Bee 🐝 October 17, 2026\nGenius: 128 points\n42 words, 2 pangrams\n🟨🟨🟨🟨🟨🟨🟨🟨🟨',
    );
  });

  it('handles singulars and Queen Bee', () => {
    expect(shareText({ day: 3083, rank: 0, points: 1, words: 1, pangrams: 0 })).toBe(
      'Spelling Bee 🐝 October 17, 2026\nBeginner: 1 point\n1 word, 0 pangrams\n🟨⬜⬜⬜⬜⬜⬜⬜⬜',
    );
    expect(shareText({ day: 3083, rank: 9, points: 1234, words: 60, pangrams: 1 }).split('\n').slice(1)).toEqual([
      'Queen Bee: 1,234 points',
      '60 words, 1 pangram',
      '🟨🟨🟨🟨🟨🟨🟨🟨🟨👑',
    ]);
  });
});
