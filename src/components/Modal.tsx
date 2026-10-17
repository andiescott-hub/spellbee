import { useEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from './icons';

interface Props {
  label: string;
  onClose: () => void;
  /** Text shown beside the close button, e.g. "Back to puzzle". */
  closeText?: string;
  /** A small centred card on every screen size, rather than a full page on phones. */
  card?: boolean;
  children: ReactNode;
}

/** Full-screen page on phones, centred card on larger screens. */
export function Modal({ label, onClose, closeText, card, children }: Props) {
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={`overlay${card ? ' card' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={dialog}>
        <button type="button" className="modal-close" onClick={onClose} aria-label={closeText ?? 'Close'}>
          {closeText && <span>{closeText}</span>}
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>
  );
}
