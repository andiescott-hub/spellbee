import { GENIUS, RANKS } from '../lib/score';

interface Props {
  score: number;
  rank: number;
  onClick: () => void;
}

/** Rank name and NYT's dotted progress line, with the score on the current rank. Opens Rankings. */
export function ProgressBar({ score, rank, onClick }: Props) {
  // The line shows Beginner to Genius. Queen Bee sits on the Genius dot.
  const position = (Math.min(rank, GENIUS) / GENIUS) * 100;
  return (
    <button
      type="button"
      className="progress"
      onClick={onClick}
      aria-label={`Rank: ${RANKS[rank].name}, ${score} ${score === 1 ? 'point' : 'points'}. Open rankings`}
    >
      <span className="progress-rank">{RANKS[rank].name}</span>
      <span className="progress-bar" aria-hidden="true">
        <span className="progress-line" />
        {RANKS.slice(0, GENIUS + 1).map((r, i) => (
          <span
            key={r.name}
            className={`progress-dot${i <= rank ? ' reached' : ''}`}
            style={{ left: `${(i / GENIUS) * 100}%` }}
          />
        ))}
        <span className="progress-marker" style={{ left: `${position}%` }}>
          {score}
        </span>
      </span>
    </button>
  );
}
