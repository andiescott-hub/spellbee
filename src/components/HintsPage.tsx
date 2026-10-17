import { useState } from 'react';
import { formatDay } from '../lib/date';
import { hintGrid, hintSummary, twoLetterList, type HintSummary } from '../lib/hints';
import type { Puzzle } from '../lib/puzzle';
import { Modal } from './Modal';

interface Props {
  day: number;
  puzzle: Puzzle;
  found: string[];
  onClose: () => void;
}

type Mode = 'left' | 'all';

function summaryLine(s: HintSummary, total: HintSummary): string {
  const perfect = total.perfect > 0 ? ` (${total.perfect} Perfect)` : '';
  return `WORDS: ${s.words}, POINTS: ${s.points}, PANGRAMS: ${s.pangrams}${perfect}${total.bingo ? ', BINGO' : ''}`;
}

/** NYT's daily hints: the Spelling Bee Grid and Two-Letter List, counting down as words are found. */
export function HintsPage({ day, puzzle, found, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('left');
  const foundSet = new Set(found);
  const remaining = puzzle.answers.filter((w) => !foundSet.has(w));
  const counted = mode === 'left' ? remaining : puzzle.answers;
  const total = hintSummary(puzzle.answers);
  const grid = hintGrid(puzzle.answers, counted);
  const pairs = twoLetterList(puzzle.answers, counted);

  return (
    <Modal label="Hints" onClose={onClose} closeText="Back to puzzle">
      <section className="hints">
        <h2 className="modal-heading">Today’s Hints</h2>
        <p className="page-date">{formatDay(day)}</p>

        <p className="hints-letters">
          <strong className="bright">{puzzle.center}</strong>
          {puzzle.outer.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </p>
        <p className="hints-summary">{summaryLine(total, total)}</p>

        <div className="segmented" role="radiogroup" aria-label="Count">
          {(['left', 'all'] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
              {m === 'left' ? 'Words left' : 'All words'}
            </button>
          ))}
        </div>
        <p className="hints-note">
          {mode === 'left'
            ? remaining.length === 0
              ? 'You found every word. Queen Bee!'
              : `Still to find: ${summaryLine(hintSummary(remaining), { ...total, perfect: 0, bingo: false })}`
            : 'Counts for every word in today’s puzzle.'}
        </p>

        <h3 className="hints-title">Spelling Bee Grid</h3>
        <div className="hint-grid-wrap">
          <table className="hint-grid">
            <thead>
              <tr>
                <th />
                {grid.lengths.map((n) => (
                  <th key={n} scope="col">
                    {n}
                  </th>
                ))}
                <th scope="col">Σ</th>
              </tr>
            </thead>
            <tbody>
              {grid.rows.map((r) => (
                <tr key={r.letter} className={r.total === 0 ? 'done' : undefined}>
                  <th scope="row">{r.letter}:</th>
                  {r.counts.map((c, i) => (
                    <td key={i}>{c || '-'}</td>
                  ))}
                  <td className="sum">{r.total}</td>
                </tr>
              ))}
              <tr className="totals">
                <th scope="row">Σ:</th>
                {grid.totals.map((c, i) => (
                  <td key={i}>{c || '-'}</td>
                ))}
                <td className="sum">{grid.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="hints-title">Two-Letter List</h3>
        <div className="two-letter">
          {pairs.map((group) => (
            <p key={group[0].prefix[0]}>
              {group.map(({ prefix, count }) => (
                <span key={prefix} className={count === 0 ? 'done' : undefined}>
                  {prefix}-{count}
                </span>
              ))}
            </p>
          ))}
        </div>
      </section>
    </Modal>
  );
}
