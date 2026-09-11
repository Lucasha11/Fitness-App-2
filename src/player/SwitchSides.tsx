import { useEffect, useState } from 'react';
import { SwapIcon } from '../components/icons';
import { Mascot } from '../components/Mascot';
import type { Exercise } from '../exercises';
import { poseFor } from './poses';

/** Seconds the switch-sides overlay holds, per the design. */
const COUNT_FROM = 3;

/**
 * C3 · a brief full-width overlay halfway through an exercise that works one
 * side at a time. The player stays visible behind it, dimmed.
 */
export function SwitchSides({
  exercise,
  onDone,
}: {
  exercise: Exercise;
  onDone: () => void;
}) {
  const [count, setCount] = useState(COUNT_FROM);

  useEffect(() => {
    let left = COUNT_FROM;
    const timer = window.setInterval(() => {
      left -= 1;
      if (left <= 0) {
        window.clearInterval(timer);
        onDone();
        return;
      }
      setCount(left);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onDone]);

  return (
    <div className="switch-overlay" role="alert">
      <div className="switch-overlay__figures">
        <Mascot name={poseFor(exercise)} size={96} alt="Left side" />
        <SwapIcon size={34} style={{ color: 'var(--lime)' }} strokeWidth={2.5} />
        <Mascot name={poseFor(exercise)} size={96} alt="Right side" />
      </div>

      <div>
        <p className="switch-overlay__title">Switch sides</p>
        <p className="switch-overlay__sub">Same thing, other arm</p>
      </div>

      <div className="switch-overlay__count">{count}</div>
    </div>
  );
}
