import { useState } from 'react';
import type { ImportInput, Stats } from '../lib/stats';
import { ImportStatsForm } from './ImportStatsForm';
import { Modal } from './Modal';

interface Props {
  darkTheme: boolean;
  onDarkTheme: (on: boolean) => void;
  stats: Stats;
  hasStats: boolean;
  onImport: (input: ImportInput) => void;
  onClose: () => void;
}

export function SettingsModal(p: Props) {
  const [importing, setImporting] = useState(false);

  return (
    <Modal label="Settings" onClose={p.onClose}>
      <section className="settings">
        <h2 className="modal-heading">Settings</h2>
        <div className="setting">
          <div className="setting-text">
            <div className="setting-title">Dark Theme</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={p.darkTheme}
            aria-label="Dark Theme"
            className="switch"
            onClick={() => p.onDarkTheme(!p.darkTheme)}
          >
            <span className="knob" />
          </button>
        </div>
        <div className="setting">
          <div className="setting-text">
            <div className="setting-title">Import Stats</div>
            <div className="setting-description">Carry over your numbers from NYT Spelling Bee</div>
          </div>
          {!importing && (
            <button type="button" className="outline-button small" onClick={() => setImporting(true)}>
              Import
            </button>
          )}
        </div>
        {importing && (
          <ImportStatsForm
            stats={p.stats}
            hasStats={p.hasStats}
            onCancel={() => setImporting(false)}
            onImport={(input) => {
              p.onImport(input);
              setImporting(false);
            }}
          />
        )}
      </section>
    </Modal>
  );
}
