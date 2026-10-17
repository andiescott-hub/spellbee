import { GENIUS, QUEEN_BEE, RANKS, rankThresholds } from '../lib/score';
import { Modal } from './Modal';

interface Props {
  score: number;
  rank: number;
  totalPoints: number;
  onClose: () => void;
}

export function RankingsModal({ score, rank, totalPoints, onClose }: Props) {
  const thresholds = rankThresholds(totalPoints);
  // As on NYT, Queen Bee stays a secret until it's reached.
  const shown = rank === QUEEN_BEE ? QUEEN_BEE : GENIUS;
  const rows = RANKS.slice(0, shown + 1)
    .map((r, i) => ({ ...r, index: i, min: thresholds[i] }))
    .reverse();

  return (
    <Modal label="Rankings" card onClose={onClose}>
      <section className="rankings">
        <h2 className="modal-heading">Rankings</h2>
        <p className="rankings-intro">
          Ranks are based on a percentage of possible points in a puzzle. The minimum scores to reach each rank for
          today’s are:
        </p>
        <ul className="rankings-list">
          {rows.map((r) => {
            const current = r.index === rank;
            return (
              <li key={r.name} className={current ? 'current' : r.index < rank ? 'reached' : undefined} aria-current={current || undefined}>
                <span className="rankings-dot">{current ? score : ''}</span>
                <span className="rankings-name">{r.name}</span>
                <span className="rankings-min">{r.min}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </Modal>
  );
}
