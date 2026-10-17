import { useState, type FormEvent } from 'react';
import { validateImport, type ImportInput, type Stats } from '../lib/stats';

interface Props {
  stats: Stats;
  hasStats: boolean;
  onImport: (input: ImportInput) => void;
  onCancel: () => void;
}

type Field = 'played' | 'words' | 'pangrams' | 'genius' | 'queenBee';

const FIELDS: { key: Field; label: string }[] = [
  { key: 'played', label: 'Puzzles played' },
  { key: 'words', label: 'Words found' },
  { key: 'pangrams', label: 'Pangrams found' },
  { key: 'genius', label: 'Genius' },
  { key: 'queenBee', label: 'Queen Bee' },
];

export function ImportStatsForm({ stats, hasStats, onImport, onCancel }: Props) {
  const [values, setValues] = useState<Record<Field, string>>({
    played: String(stats.played),
    words: String(stats.words),
    pangrams: String(stats.pangrams),
    genius: String(stats.genius),
    queenBee: String(stats.queenBee),
  });
  const [longest, setLongest] = useState(stats.longest);
  const [includesToday, setIncludesToday] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toNumber = (v: string) => (v.trim() === '' ? 0 : Number(v));

  function submit(e: FormEvent) {
    e.preventDefault();
    const input: ImportInput = {
      played: toNumber(values.played),
      words: toNumber(values.words),
      pangrams: toNumber(values.pangrams),
      genius: toNumber(values.genius),
      queenBee: toNumber(values.queenBee),
      longest,
      includesToday,
    };
    const problem = validateImport(input);
    setError(problem);
    if (problem) return;
    if (hasStats && !window.confirm('Replace the stats saved on this device?')) return;
    onImport(input);
  }

  return (
    <form className="import-form" onSubmit={submit} noValidate>
      <p className="import-help">
        Copy the numbers from your NYT Spelling Bee stats. Stats are saved on this device only.
      </p>
      <div className="import-grid">
        {FIELDS.map(({ key, label }) => (
          <label key={key}>
            <span>{label}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            />
          </label>
        ))}
        <label className="wide">
          <span>Longest word</span>
          <input
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={longest}
            onChange={(e) => setLongest(e.target.value)}
          />
        </label>
      </div>
      <label className="import-checkbox">
        <input type="checkbox" checked={includesToday} onChange={(e) => setIncludesToday(e.target.checked)} />
        <span>
          These numbers include today's puzzle
          <small>If ticked, today's words in this app won't be added to them. Puzzles from tomorrow on will be.</small>
        </span>
      </label>
      {error && (
        <p className="import-error" role="alert">
          {error}
        </p>
      )}
      <div className="import-actions">
        <button type="button" className="outline-button small" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="solid-button small">
          Import
        </button>
      </div>
    </form>
  );
}
