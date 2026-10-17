import { isPangram } from '../lib/score';
import { ChevronIcon } from './icons';

interface Props {
  found: string[];
  open: boolean;
  onToggle: () => void;
}

const pangramClass = (word: string) => (isPangram(word) ? 'pangram' : undefined);

/** The found-words box: newest words first when closed, every word A to Z when open. */
export function WordList({ found, open, onToggle }: Props) {
  const summary = `You have found ${found.length} ${found.length === 1 ? 'word' : 'words'}`;
  return (
    <>
      <button type="button" className={`wordlist-box${open ? ' open' : ''}`} aria-expanded={open} aria-label={summary} onClick={onToggle}>
        {open ? (
          <span className="wordlist-summary">{summary}</span>
        ) : found.length > 0 ? (
          <span className="wordlist-recent">
            {[...found].reverse().map((w) => (
              <span key={w} className={pangramClass(w)}>
                {w}
              </span>
            ))}
          </span>
        ) : (
          <span className="wordlist-placeholder">Your words...</span>
        )}
        <span className="wordlist-chevron">
          <ChevronIcon />
        </span>
      </button>
      {open && (
        <div className="wordlist-drawer">
          <ul className="wordlist-words" aria-label="Found words">
            {[...found].sort().map((w) => (
              <li key={w} className={pangramClass(w)}>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
