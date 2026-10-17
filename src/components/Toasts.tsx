import { useCallback, useEffect, useRef, useState } from 'react';

interface Toast {
  id: number;
  text: string;
  leaving: boolean;
}

const FADE_MS = 300;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const showToast = useCallback((text: string, duration = 1000) => {
    const id = nextId.current++;
    setToasts((list) => [{ id, text, leaving: false }, ...list]);
    timers.current.push(
      window.setTimeout(() => setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t))), duration),
      window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), duration + FADE_MS),
    );
  }, []);

  return { toasts, showToast };
}

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.leaving ? ' leaving' : ''}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
