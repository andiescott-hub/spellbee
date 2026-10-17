import { RANKS } from '../lib/score';
import type { Stats } from '../lib/stats';
import { Countdown } from './Countdown';
import { ShareIcon } from './icons';
import { Modal } from './Modal';

interface Today {
  rank: number;
  points: number;
  words: number;
  totalPoints: number;
  totalWords: number;
}

interface Props {
  stats: Stats;
  today: Today;
  onShare: () => void;
  onClose: () => void;
}

export function StatsPage({ stats, today, onShare, onClose }: Props) {
  const played = today.words > 0;
  return (
    <Modal label="Statistics" onClose={onClose} closeText="Back to puzzle">
      <section className="stats">
        <h2 className="modal-heading">Statistics</h2>

        <div className="stats-today">
          <div className="stats-today-label">Today</div>
          {played ? (
            <>
              <div className="stats-today-rank">{RANKS[today.rank].name}</div>
              <div className="stats-today-detail">
                {today.points} of {today.totalPoints} points · {today.words} of {today.totalWords} words
              </div>
            </>
          ) : (
            <div className="stats-today-detail">No words found yet today.</div>
          )}
        </div>

        <div className="stats-grid">
          <Stat value={stats.played} label="Puzzles Played" />
          <Stat value={stats.words} label="Words Found" />
          <Stat value={stats.pangrams} label="Pangrams Found" />
          <Stat value={stats.genius} label="Genius" />
          <Stat value={stats.queenBee} label="Queen Bee" />
        </div>

        <div className="stats-longest">
          <div className="stats-longest-label">Longest Word</div>
          {stats.longest ? (
            <div className="stats-longest-word">
              {stats.longest} <span>({stats.longest.length} letters)</span>
            </div>
          ) : (
            <div className="stats-longest-word none">None yet</div>
          )}
        </div>

        {played && (
          <button type="button" className="share-button" onClick={onShare}>
            Share <ShareIcon />
          </button>
        )}
        <div className="countdown">
          <div className="countdown-label">Next puzzle in</div>
          <Countdown />
        </div>
      </section>
    </Modal>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value.toLocaleString('en-US')}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
