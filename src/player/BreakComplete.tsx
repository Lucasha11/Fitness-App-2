import { useEffect, useState } from 'react';
import { FlameIcon } from '../components/icons';
import { useCoachNoun } from '../components/coach';
import { Mascot } from '../components/Mascot';
import './player.css';

/** The design's auto-dismiss window, in seconds. */
const AUTO_DISMISS = 6;

function movedLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} sec moved today`;
  if (rest === 0) return `${minutes} min moved today`;
  return `${minutes} min ${rest} sec moved today`;
}

/**
 * C6 · celebratory but fast, and it gets out of the way on its own.
 */
export function BreakComplete({
  doneToday,
  goal,
  movedSeconds,
  streak,
  onDone,
  onOneMore,
  onFeedback,
}: {
  doneToday: number;
  goal: number;
  movedSeconds: number;
  streak: number;
  onDone: () => void;
  onOneMore: () => void;
  onFeedback: () => void;
}) {
  const [countdown, setCountdown] = useState(AUTO_DISMISS);

  useEffect(() => {
    let left = AUTO_DISMISS;
    const timer = window.setInterval(() => {
      left -= 1;
      setCountdown(left);
      if (left <= 0) {
        window.clearInterval(timer);
        onDone();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onDone]);

  const coach = useCoachNoun();
  const streakLabel =
    streak > 1 ? `${streak}-day streak safe` : 'Streak started';

  return (
    <section className="complete" aria-label="Break complete">
      <div className="complete__halo bob">
        <Mascot name="thumbsup" size={165} alt={`Your ${coach} celebrating`} />
      </div>

      <div>
        <h1 className="complete__title">
          Break {doneToday} of {goal}
        </h1>
        <p className="complete__sub">{movedLabel(movedSeconds)}</p>
      </div>

      <div>
        <span className="complete__streak">
          <FlameIcon size={15} />
          {streakLabel}
        </span>
      </div>

      <div className="complete__actions">
        <button type="button" className="complete__done" onClick={onDone}>
          Done
        </button>
        <button type="button" className="complete__more" onClick={onOneMore}>
          One more
        </button>
        <button
          type="button"
          className="complete__feedback"
          onClick={onFeedback}
        >
          How was that?
        </button>
      </div>

      <div className="complete__timer" aria-live="off">
        Closing in {Math.max(0, countdown)}s
      </div>
    </section>
  );
}
