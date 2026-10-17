import { HelpIcon, HintsIcon, SettingsIcon, StatsIcon, YesterdayIcon } from './icons';

interface Props {
  onHints: () => void;
  onYesterday: () => void;
  onStats: () => void;
  onHelp: () => void;
  onSettings: () => void;
}

export function Header({ onHints, onYesterday, onStats, onHelp, onSettings }: Props) {
  return (
    <header className="header">
      <h1 className="wordmark">Spelling Bee</h1>
      <nav className="header-icons">
        <button type="button" className="icon-button" aria-label="Hints" onClick={onHints}>
          <HintsIcon />
        </button>
        <button type="button" className="icon-button" aria-label="Yesterday's Answers" onClick={onYesterday}>
          <YesterdayIcon />
        </button>
        <button type="button" className="icon-button" aria-label="Statistics" onClick={onStats}>
          <StatsIcon />
        </button>
        <button type="button" className="icon-button" aria-label="How to Play" onClick={onHelp}>
          <HelpIcon />
        </button>
        <button type="button" className="icon-button" aria-label="Settings" onClick={onSettings}>
          <SettingsIcon />
        </button>
      </nav>
    </header>
  );
}
