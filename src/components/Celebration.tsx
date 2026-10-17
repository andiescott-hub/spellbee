import { Bee, ShareIcon } from './icons';
import { Modal } from './Modal';

interface Props {
  kind: 'genius' | 'queen';
  totalWords: number;
  onShare: () => void;
  onClose: () => void;
}

/** Shown once a day on reaching Genius, and again on finding every word. */
export function Celebration({ kind, totalWords, onShare, onClose }: Props) {
  const queen = kind === 'queen';
  return (
    <Modal label={queen ? 'Queen Bee' : 'Genius'} card onClose={onClose}>
      <section className="celebration">
        <Bee crown={queen} />
        <h2 className="celebration-heading">{queen ? 'Queen Bee!' : 'Genius!'}</h2>
        <p>
          {queen
            ? `You found all ${totalWords} words in today’s puzzle. Come back tomorrow for a new one.`
            : 'You’ve reached the highest rank. Keep going and find every word to become Queen Bee.'}
        </p>
        <div className="celebration-actions">
          <button type="button" className="solid-button" onClick={onClose}>
            {queen ? 'Back to puzzle' : 'Keep playing'}
          </button>
          <button type="button" className="outline-button" onClick={onShare}>
            Share <ShareIcon />
          </button>
        </div>
      </section>
    </Modal>
  );
}
