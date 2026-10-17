import { formatDay } from '../lib/date';
import type { Puzzle } from '../lib/puzzle';
import { RANKS, isPangram, rankIndex, totalScore } from '../lib/score';
import { Modal } from './Modal';

interface Props {
  day: number;
  puzzle: Puzzle;
  found: string[];
  onClose: () => void;
}

export function YesterdayPage({ day, puzzle, found, onClose }: Props) {
  const foundSet = new Set(found);
  const rank = rankIndex(totalScore(found), puzzle.totalPoints);
  const words = puzzle.answers.length;

  return (
    <Modal label="Yesterday's Answers" onClose={onClose} closeText="Back to puzzle">
      <section className="yesterday">
        <h2 className="modal-heading">Yesterday’s Answers</h2>
        <p className="page-date">{formatDay(day)}</p>
        <p className="hints-letters">
          <strong className="bright">{puzzle.center}</strong>
          {puzzle.outer.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </p>
        <p className="yesterday-summary">
          {found.length > 0
            ? `You found ${found.length} of ${words} words and reached ${RANKS[rank].name}.`
            : `${words} words, ${puzzle.totalPoints} points.`}
        </p>
        <ul className="answers-list">
          {puzzle.answers.map((w) => (
            <li key={w} className={`${isPangram(w) ? 'pangram' : ''}${foundSet.has(w) ? ' found' : ''}`.trim() || undefined}>
              {w}
            </li>
          ))}
        </ul>
        <p className="yesterday-key">
          Pangrams are in <strong>bold</strong>.{found.length > 0 && ' Words you found are ticked.'}
        </p>
      </section>
    </Modal>
  );
}
