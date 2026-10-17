import { formatDay } from './date';
import { RANKS } from './score';

interface ShareOptions {
  day: number;
  rank: number;
  points: number;
  words: number;
  pangrams: number;
}

const plural = (n: number, word: string) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;

/** A spoiler-free summary of the day's game: date, rank, score, and a bar of ranks reached. */
export function shareText(o: ShareOptions): string {
  const filled = Math.min(o.rank, 8) + 1;
  const bar = '🟨'.repeat(filled) + '⬜'.repeat(9 - filled);
  return [
    `Spelling Bee 🐝 ${formatDay(o.day, false)}`,
    `${RANKS[o.rank].name}: ${plural(o.points, 'point')}`,
    `${plural(o.words, 'word')}, ${plural(o.pangrams, 'pangram')}`,
    bar + (o.rank === 9 ? '👑' : ''),
  ].join('\n');
}

function isMobile(): boolean {
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Uses the native share sheet on phones and the clipboard elsewhere, like NYT. */
export async function shareResults(text: string): Promise<ShareOutcome> {
  if (isMobile() && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
