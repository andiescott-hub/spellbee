import { useEffect, useState } from 'react';
import { formatCountdown, msUntilNextDay } from '../lib/date';

/** Live HH:MM:SS until the next local midnight, when the next puzzle arrives. */
export function Countdown() {
  const [ms, setMs] = useState(() => msUntilNextDay());
  useEffect(() => {
    const timer = window.setInterval(() => setMs(msUntilNextDay()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="countdown-time">{formatCountdown(ms)}</span>;
}
