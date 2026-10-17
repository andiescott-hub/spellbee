import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Celebration } from './components/Celebration';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { HintsPage } from './components/HintsPage';
import { Hive, HiveActions } from './components/Hive';
import { HiveInput } from './components/HiveInput';
import { Message, useMessage } from './components/Message';
import { ProgressBar } from './components/ProgressBar';
import { RankingsModal } from './components/RankingsModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsPage } from './components/StatsPage';
import { Toasts, useToasts } from './components/Toasts';
import { WordList } from './components/WordList';
import { YesterdayPage } from './components/YesterdayPage';
import { dayIndex, msUntilNextDay } from './lib/date';
import { puzzleForDay, type Puzzle } from './lib/puzzle';
import {
  GENIUS,
  MAX_LENGTH,
  QUEEN_BEE,
  isPangram,
  rankIndex,
  rejection,
  successMessage,
  totalScore,
  wordScore,
} from './lib/score';
import { shareResults, shareText } from './lib/share';
import { computeStats, dayRecord, importStats, recordDay, type ImportInput, type StatsStore } from './lib/stats';
import { KEYS, load, save } from './lib/storage';

interface DayGame {
  /** Words found, in the order they were found. */
  found: string[];
  /** Whether the Genius and Queen Bee celebrations have been shown. */
  seenGenius: boolean;
  seenQueen: boolean;
}

/** Saved games by puzzle day. Only today and yesterday are kept. */
type Games = Record<string, Partial<DayGame>>;

interface Settings {
  /** null follows the system setting until the player picks one. */
  darkTheme: boolean | null;
}

type ModalName = 'help' | 'settings' | 'stats' | 'rankings' | 'hints' | 'yesterday' | 'genius' | 'queen';

const DEFAULT_SETTINGS: Settings = { darkTheme: null };

const EMPTY_GAME: DayGame = { found: [], seenGenius: false, seenQueen: false };

// How long a rejected word shakes before it clears, and the pause before a celebration opens.
const REJECT_MS = 700;
const SHUFFLE_FADE_MS = 150;
const CELEBRATE_DELAY_MS = 1400;

function loadGames(): Games {
  const saved = load<unknown>(KEYS.games, {});
  return saved && typeof saved === 'object' && !Array.isArray(saved) ? (saved as Games) : {};
}

/** A saved day's game, keeping only words that answer that day's puzzle. */
function readGame(games: Games, day: number, puzzle: Puzzle): DayGame {
  const saved = games[day];
  if (!saved || !Array.isArray(saved.found)) return EMPTY_GAME;
  const answers = new Set(puzzle.answers);
  return {
    found: [...new Set(saved.found.filter((w) => typeof w === 'string' && answers.has(w)))],
    seenGenius: saved.seenGenius === true,
    seenQueen: saved.seenQueen === true,
  };
}

function loadStats(): StatsStore {
  const saved = load<Partial<StatsStore> | null>(KEYS.stats, null);
  const days = saved?.days && typeof saved.days === 'object' ? saved.days : {};
  return { days, imported: saved?.imported ?? null };
}

/** A new random order for the outer letters, never the same as the current one. */
function shuffled(letters: string[]): string[] {
  const next = [...letters];
  do {
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
  } while (next.join('') === letters.join(''));
  return next;
}

function useSystemDark(): boolean {
  const [query] = useState(() =>
    typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null,
  );
  const [dark, setDark] = useState(() => query?.matches ?? true);
  useEffect(() => {
    if (!query) return;
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [query]);
  return dark;
}

/** Tracks the puzzle day and swaps in a fresh puzzle at local midnight. */
export default function App() {
  const [today, setToday] = useState(() => dayIndex());

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(check, msUntilNextDay() + 250);
    };
    const check = () => {
      const now = dayIndex();
      if (now !== today) setToday(now);
      else schedule();
    };
    schedule();
    // Phones pause timers in the background, so also re-check when the app comes back.
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, [today]);

  return <SpellingBee key={today} day={today} />;
}

function SpellingBee({ day }: { day: number }) {
  const puzzle = useMemo(() => puzzleForDay(day), [day]);
  const yesterday = useMemo(() => puzzleForDay(day - 1), [day]);
  const [games, setGames] = useState(loadGames);
  const game = useMemo(() => readGame(games, day, puzzle), [games, day, puzzle]);
  const [store, setStore] = useState(loadStats);
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...load<Partial<Settings>>(KEYS.settings, {}) }));
  const [input, setInput] = useState('');
  const [outer, setOuter] = useState(puzzle.outer);
  const [shuffling, setShuffling] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [wordListOpen, setWordListOpen] = useState(false);
  const [modal, setModal] = useState<ModalName | null>(null);
  const { message, showMessage } = useMessage();
  const { toasts, showToast } = useToasts();
  const systemDark = useSystemDark();
  const darkTheme = settings.darkTheme ?? systemDark;

  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const kept: Games = {};
    for (const d of [day - 1, day]) if (games[d]) kept[d] = games[d];
    save(KEYS.games, kept);
  }, [games, day]);
  useEffect(() => save(KEYS.stats, store), [store]);
  useEffect(() => save(KEYS.settings, settings), [settings]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkTheme ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', darkTheme ? '#121213' : '#ffffff');
  }, [darkTheme]);

  const found = game.found;
  const foundSet = useMemo(() => new Set(found), [found]);
  const letters = useMemo(() => new Set([puzzle.center, ...puzzle.outer]), [puzzle]);
  const score = totalScore(found);
  const rank = rankIndex(score, puzzle.totalPoints);
  const stats = useMemo(() => computeStats(store), [store]);

  const updateGame = (fn: (g: DayGame) => DayGame) =>
    setGames((all) => ({ ...all, [day]: fn(readGame(all, day, puzzle)) }));

  // The typed word also lives in a ref so fast typing never builds on a stale value.
  const word = useRef('');
  const setWord = (w: string) => {
    word.current = w;
    setInput(w);
  };

  // A rejected word shakes, then clears, unless the player starts a new word first.
  const rejectTimer = useRef<number | null>(null);
  const endReject = () => {
    if (rejectTimer.current === null) return false;
    clearTimeout(rejectTimer.current);
    rejectTimer.current = null;
    setShaking(false);
    setWord('');
    return true;
  };
  const reject = (text: string) => {
    showMessage(text, 'error');
    setShaking(true);
    if (rejectTimer.current !== null) clearTimeout(rejectTimer.current);
    rejectTimer.current = later(endReject, REJECT_MS);
  };

  function addLetter(letter: string) {
    endReject();
    const next = word.current + letter;
    setWord(next);
    if (next.length > MAX_LENGTH) reject('Too long');
  }

  function deleteLetter() {
    if (!endReject()) setWord(word.current.slice(0, -1));
  }

  function celebrate(kind: 'genius' | 'queen') {
    updateGame((g) => ({ ...g, seenGenius: true, seenQueen: g.seenQueen || kind === 'queen' }));
    later(() => {
      setWordListOpen(false);
      setModal(kind);
    }, CELEBRATE_DELAY_MS);
  }

  function submit() {
    const guess = word.current;
    if (guess === '' || rejectTimer.current !== null) return;
    const problem = rejection(guess, puzzle, foundSet);
    if (problem) return reject(problem);

    const nextFound = [...found, guess];
    const nextRank = rankIndex(totalScore(nextFound), puzzle.totalPoints);
    updateGame((g) => (g.found.includes(guess) ? g : { ...g, found: [...g.found, guess] }));
    setStore((s) => recordDay(s, day, dayRecord(puzzle, nextFound)));
    setWord('');
    showMessage(successMessage(guess), isPangram(guess) ? 'pangram' : 'success', wordScore(guess), 1200);

    if (nextRank === QUEEN_BEE && !game.seenQueen) celebrate('queen');
    else if (nextRank >= GENIUS && !game.seenGenius) celebrate('genius');
  }

  function shuffle() {
    if (shuffling) return;
    setShuffling(true);
    later(() => {
      setOuter(shuffled);
      setShuffling(false);
    }, SHUFFLE_FADE_MS);
  }

  function onKey(key: string) {
    if (modal) return;
    setWordListOpen(false);
    if (key === 'enter') submit();
    else if (key === 'backspace') deleteLetter();
    else if (key === ' ') shuffle();
    else if (/^[a-z]$/.test(key)) addLetter(key);
  }

  // Physical keyboard, routed through the latest onKey so it always sees current state.
  const onKeyRef = useRef(onKey);
  onKeyRef.current = onKey;
  const modalRef = useRef(modal);
  modalRef.current = modal;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || modalRef.current) return;
      const key = e.key.toLowerCase();
      if (key === 'enter' || key === 'backspace' || key === ' ' || /^[a-z]$/.test(key)) {
        e.preventDefault();
        onKeyRef.current(key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function onImport(input: ImportInput) {
    setStore((s) => importStats(s, input, day));
    showToast('Stats imported', 1500);
  }

  async function onShare() {
    const text = shareText({ day, rank, points: score, words: found.length, pangrams: found.filter(isPangram).length });
    const outcome = await shareResults(text);
    if (outcome === 'copied') showToast('Copied results to clipboard', 2000);
    if (outcome === 'failed') showToast('Could not share results', 2000);
  }

  const closeModal = useCallback(() => setModal(null), []);
  const open = (name: ModalName) => () => {
    setWordListOpen(false);
    setModal(name);
  };

  return (
    <div className="app">
      <Header
        onHints={open('hints')}
        onYesterday={open('yesterday')}
        onStats={open('stats')}
        onHelp={open('help')}
        onSettings={open('settings')}
      />
      <Toasts toasts={toasts} />
      <main className="game">
        <ProgressBar score={score} rank={rank} onClick={open('rankings')} />
        <WordList found={found} open={wordListOpen} onToggle={() => setWordListOpen((o) => !o)} />
        <div className="play">
          <div className="input-area">
            <Message message={message} />
            <HiveInput input={input} center={puzzle.center} letters={letters} shaking={shaking} />
          </div>
          <Hive center={puzzle.center} outer={outer} shuffling={shuffling} onLetter={addLetter} />
          <HiveActions onDelete={deleteLetter} onShuffle={shuffle} onEnter={submit} />
        </div>
      </main>

      {modal === 'help' && <HelpModal onClose={closeModal} />}
      {modal === 'rankings' && (
        <RankingsModal score={score} rank={rank} totalPoints={puzzle.totalPoints} onClose={closeModal} />
      )}
      {modal === 'hints' && <HintsPage day={day} puzzle={puzzle} found={found} onClose={closeModal} />}
      {modal === 'yesterday' && (
        <YesterdayPage day={day - 1} puzzle={yesterday} found={readGame(games, day - 1, yesterday).found} onClose={closeModal} />
      )}
      {modal === 'stats' && (
        <StatsPage
          stats={stats}
          today={{ rank, points: score, words: found.length, totalPoints: puzzle.totalPoints, totalWords: puzzle.answers.length }}
          onShare={onShare}
          onClose={closeModal}
        />
      )}
      {modal === 'settings' && (
        <SettingsModal
          darkTheme={darkTheme}
          onDarkTheme={(on) => setSettings((s) => ({ ...s, darkTheme: on }))}
          stats={stats}
          hasStats={stats.played > 0}
          onImport={onImport}
          onClose={closeModal}
        />
      )}
      {(modal === 'genius' || modal === 'queen') && (
        <Celebration kind={modal} totalWords={puzzle.answers.length} onShare={onShare} onClose={closeModal} />
      )}
    </div>
  );
}
