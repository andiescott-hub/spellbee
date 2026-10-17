import { useCallback, useEffect, useRef, useState } from 'react';

interface MessageState {
  id: number;
  text: string;
  kind: 'error' | 'success' | 'pangram';
  /** Points scored, shown beside a success message. */
  points?: number;
  leaving: boolean;
}

const FADE_MS = 200;

/** The single message NYT shows above the input: an error, or the praise for a word. */
export function useMessage() {
  const [message, setMessage] = useState<MessageState | null>(null);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const showMessage = useCallback((text: string, kind: MessageState['kind'], points?: number, duration = 1000) => {
    clear();
    const id = nextId.current++;
    setMessage({ id, text, kind, points, leaving: false });
    timers.current.push(
      window.setTimeout(() => setMessage((m) => (m?.id === id ? { ...m, leaving: true } : m)), duration),
      window.setTimeout(() => setMessage((m) => (m?.id === id ? null : m)), duration + FADE_MS),
    );
  }, []);

  return { message, showMessage };
}

export function Message({ message }: { message: MessageState | null }) {
  return (
    <div className="message-area" aria-live="polite">
      {message && (
        <div key={message.id} className={`message ${message.kind}${message.leaving ? ' leaving' : ''}`}>
          <span className="message-text">{message.text}</span>
          {message.points !== undefined && <span className="message-points">+{message.points}</span>}
        </div>
      )}
    </div>
  );
}
