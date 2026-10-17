import type { CSSProperties, MouseEvent } from 'react';
import { ShuffleIcon } from './icons';

// Flat-topped hexagons: width W, height H, with an even GAP between neighbouring edges.
const W = 100;
const H = (W * Math.sqrt(3)) / 2;
const GAP = 8;
const STEP = H + GAP;
const DX = STEP * Math.cos(Math.PI / 6);
const WIDTH = 2 * DX + W;
const HEIGHT = 2 * STEP + H;

// The six outer cells, clockwise from the upper left, as NYT lays them out.
const OFFSETS: [number, number][] = [
  [-DX, -STEP / 2],
  [0, -STEP],
  [DX, -STEP / 2],
  [DX, STEP / 2],
  [0, STEP],
  [-DX, STEP / 2],
];

const pct = (n: number) => `${n * 100}%`;

function cellStyle([x, y]: [number, number]): CSSProperties {
  return {
    left: pct((WIDTH / 2 + x - W / 2) / WIDTH),
    top: pct((HEIGHT / 2 + y - H / 2) / HEIGHT),
    width: pct(W / WIDTH),
    height: pct(H / HEIGHT),
  };
}

interface Props {
  center: string;
  outer: string[];
  /** True while the outer letters fade out and back in after a shuffle. */
  shuffling: boolean;
  onLetter: (letter: string) => void;
}

export function Hive({ center, outer, shuffling, onLetter }: Props) {
  // Drop focus after a tap so a physical Enter press can't re-trigger the last button.
  const press = (letter: string) => (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    onLetter(letter);
  };

  return (
    <div className={`hive${shuffling ? ' shuffling' : ''}`} role="group" aria-label="Hive" style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}>
      <button type="button" className="cell center" style={cellStyle([0, 0])} aria-label={`${center}, center letter`} onClick={press(center)}>
        <span className="cell-letter">{center}</span>
      </button>
      {outer.map((letter, i) => (
        <button type="button" key={i} className="cell outer" style={cellStyle(OFFSETS[i])} aria-label={letter} onClick={press(letter)}>
          <span className="cell-letter">{letter}</span>
        </button>
      ))}
    </div>
  );
}

interface ActionProps {
  onDelete: () => void;
  onShuffle: () => void;
  onEnter: () => void;
}

export function HiveActions({ onDelete, onShuffle, onEnter }: ActionProps) {
  const press = (fn: () => void) => (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    fn();
  };
  return (
    <div className="hive-actions">
      <button type="button" className="hive-action" onClick={press(onDelete)}>
        Delete
      </button>
      <button type="button" className="hive-action shuffle" aria-label="Shuffle" onClick={press(onShuffle)}>
        <ShuffleIcon />
      </button>
      <button type="button" className="hive-action" onClick={press(onEnter)}>
        Enter
      </button>
    </div>
  );
}
