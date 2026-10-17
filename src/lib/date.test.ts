import { describe, expect, it } from 'vitest';
import { dayIndex, formatCountdown, formatDay, msUntilNextDay } from './date';

describe('dayIndex', () => {
  it('counts days since Spelling Bee first ran', () => {
    expect(dayIndex(new Date(2018, 4, 9, 12))).toBe(0);
    expect(dayIndex(new Date(2026, 9, 17, 11))).toBe(3083);
  });

  it('changes at local midnight', () => {
    expect(dayIndex(new Date(2026, 9, 17, 23, 59, 59))).toBe(3083);
    expect(dayIndex(new Date(2026, 9, 18, 0, 0, 0))).toBe(3084);
  });

  it('stays one per day across DST changes', () => {
    // Covers both northern and southern hemisphere DST dates whatever TZ the tests run in.
    for (let d = new Date(2026, 0, 1); d.getFullYear() === 2026; d.setDate(d.getDate() + 1)) {
      const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      expect(dayIndex(next) - dayIndex(d)).toBe(1);
    }
  });
});

describe('formatDay', () => {
  it('gives the calendar date of a puzzle day', () => {
    expect(formatDay(3083)).toBe('Saturday, October 17, 2026');
    expect(formatDay(3082, false)).toBe('October 16, 2026');
  });
});

describe('countdown', () => {
  it('counts down to local midnight', () => {
    expect(msUntilNextDay(new Date(2026, 9, 17, 23, 0, 0))).toBe(3_600_000);
    expect(formatCountdown(3_600_000 + 61_000)).toBe('01:01:01');
    expect(formatCountdown(-5)).toBe('00:00:00');
  });
});
