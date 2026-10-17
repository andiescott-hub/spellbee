import { describe, expect, it } from 'vitest';
import { parsePuzzle } from './puzzle';
import { GENIUS, QUEEN_BEE, RANKS, rankIndex, rankThresholds, rejection, successMessage, totalScore, wordScore } from './score';

const puzzle = parsePuzzle('p acehit apathetic cape chapati heap pathetic peach');

describe('wordScore', () => {
  it('scores like NYT', () => {
    expect(wordScore('cape')).toBe(1);
    expect(wordScore('peach')).toBe(5);
    expect(wordScore('chapati')).toBe(7);
    expect(wordScore('pathetic')).toBe(8 + 7);
    expect(totalScore(['cape', 'peach'])).toBe(6);
  });
});

describe('ranks', () => {
  it('uses NYT names and percentages', () => {
    expect(RANKS.map((r) => r.name)).toEqual([
      'Beginner', 'Good Start', 'Moving Up', 'Good', 'Solid', 'Nice', 'Great', 'Amazing', 'Genius', 'Queen Bee',
    ]);
    expect(RANKS[GENIUS].name).toBe('Genius');
    expect(RANKS[QUEEN_BEE].name).toBe('Queen Bee');
  });

  it('rounds thresholds to the nearest point', () => {
    // The 17 October 2026 NYT puzzle: 144 points, Genius at 101.
    expect(rankThresholds(144)).toEqual([0, 3, 7, 12, 22, 36, 58, 72, 101, 144]);
  });

  it('finds the rank for a score', () => {
    expect(rankIndex(0, 144)).toBe(0);
    expect(rankIndex(2, 144)).toBe(0);
    expect(rankIndex(3, 144)).toBe(1);
    expect(rankIndex(100, 144)).toBe(7);
    expect(rankIndex(101, 144)).toBe(GENIUS);
    expect(rankIndex(143, 144)).toBe(GENIUS);
    expect(rankIndex(144, 144)).toBe(QUEEN_BEE);
  });
});

describe('messages', () => {
  it('praises words by length, and pangrams', () => {
    expect(successMessage('cape')).toBe('Good!');
    expect(successMessage('peach')).toBe('Nice!');
    expect(successMessage('cheapie')).toBe('Awesome!');
    expect(successMessage('pathetic')).toBe('Pangram!');
  });

  it('rejects words with NYT wording, in NYT order', () => {
    const found = new Set(['cape']);
    expect(rejection('pa', puzzle, found)).toBe('Too short');
    expect(rejection('p'.repeat(20), puzzle, found)).toBe('Too long');
    expect(rejection('spat', puzzle, found)).toBe('Bad letters');
    expect(rejection('teach', puzzle, found)).toBe('Missing center letter');
    expect(rejection('cape', puzzle, found)).toBe('Already found');
    expect(rejection('pact', puzzle, found)).toBe('Not in word list');
    expect(rejection('peach', puzzle, found)).toBeNull();
  });
});
