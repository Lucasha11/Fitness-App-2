import { useEffect, useState } from 'react';
import { ChevronRightIcon, CloseIcon, SwapIcon } from '../components/icons';
import { Mascot } from '../components/Mascot';
import { type Exercise, formatDuration } from '../exercises';
import { BODY_REGION_LABELS } from '../onboarding/state';
import { poseFor } from './poses';

/** How long the intro holds before the break starts on its own. */
const AUTO_ADVANCE_MS = 2000;
const TICK_MS = 60;

interface BreakIntroProps {
  exercise: Exercise;
  sequence: Exercise[];
  /** Plain-language reason this exercise came up now. */
  why: string;
  onStart: () => void;
  onSwap: () => void;
  onOverview: () => void;
  onClose: () => void;
}

/**
 * C1 · the half-second of context before a break starts: what you are about
 * to do, why, and a way out of it. Auto-advances; tapping skips the wait.
 */
export function BreakIntro({
  exercise,
  sequence,
  why,
  onStart,
  onSwap,
  onOverview,
  onClose,
}: BreakIntroProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const age = Date.now() - started;
      if (age >= AUTO_ADVANCE_MS) {
        window.clearInterval(timer);
        onStart();
        return;
      }
      setElapsed(age);
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [onStart]);

  const totalSeconds = sequence.reduce((sum, item) => sum + item.seconds, 0);

  return (
    <section className="player" aria-label={`Starting ${exercise.name}`}>
      <div className="intro__top">
        <button
          type="button"
          className="player__icon-btn"
          aria-label="Cancel this break"
          onClick={onClose}
        >
          <CloseIcon size={18} />
        </button>
        <button type="button" className="intro__swap" onClick={onSwap}>
          <SwapIcon size={15} />
          Swap
        </button>
      </div>

      {/* Tapping anywhere in the body skips the wait and starts the break. */}
      <div
        className="intro__body"
        role="button"
        tabIndex={0}
        aria-label="Start now"
        onClick={onStart}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onStart();
          }
        }}
      >
        <div className="intro__halo bob">
          <Mascot name={poseFor(exercise.region)} size={215} alt="Panda coach" />
        </div>

        <div>
          <h1 className="intro__name">{exercise.name}</h1>
          <div className="intro__chips">
            <span className="intro__chip intro__chip--area">
              {BODY_REGION_LABELS[exercise.region]}
            </span>
            <span className="intro__chip">
              {formatDuration(exercise.seconds)}
            </span>
            <span className="intro__chip">
              {exercise.subtle ? 'Seated' : 'Standing'}
            </span>
          </div>
        </div>

        <p className="intro__why">{why}</p>
      </div>

      <button type="button" className="intro__sequence" onClick={onOverview}>
        <span>
          {sequence.length} exercises · {Math.round(totalSeconds / 60)} min total
        </span>
        <ChevronRightIcon size={18} />
      </button>

      <div className="intro__bar" aria-hidden="true">
        <div
          className="intro__bar-fill"
          style={{ width: `${Math.min(100, (elapsed / AUTO_ADVANCE_MS) * 100)}%` }}
        />
      </div>
    </section>
  );
}
