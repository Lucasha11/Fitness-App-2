import { useEffect, useState } from 'react';
import { type Exercise, formatDuration } from '../exercises';
import { BODY_REGION_LABELS } from '../onboarding/state';

/** Seconds of breathing room between exercises. */
const REST_SECONDS = 3;

/** Normalised ring length, so the countdown arc is geometry-independent. */
const RING_LENGTH = 540;

/**
 * C4 · the breather between two exercises. Deliberately slow, with one tap
 * target to cut it short.
 */
export function RestBetween({
  next,
  onDone,
}: {
  next: Exercise;
  onDone: () => void;
}) {
  const [left, setLeft] = useState(REST_SECONDS);

  useEffect(() => {
    let remaining = REST_SECONDS;
    const timer = window.setInterval(() => {
      remaining -= 1;
      setLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(timer);
        onDone();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onDone]);

  const progress = (REST_SECONDS - left) / REST_SECONDS;

  return (
    <section className="rest" aria-label={`Next up: ${next.name}`}>
      <p className="rest__praise">Nice.</p>

      {/*
        Unlike the break timer, this ring fills towards the next exercise
        rather than draining away from the one just finished.
      */}
      <div className="rest__ring">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke="oklch(0.99 0.005 100 / 14%)"
            strokeWidth="12"
          />
          <circle
            className="rest__ring-fill"
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke="var(--mint-deep)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - progress)}
            pathLength={RING_LENGTH}
          />
        </svg>
        <div className="rest__count">{Math.max(1, left)}</div>
      </div>

      <div>
        <div className="rest__eyebrow">NEXT UP</div>
        <p className="rest__next">{next.name}</p>
        <p className="rest__meta">
          {BODY_REGION_LABELS[next.region]} · {formatDuration(next.seconds)}
        </p>
      </div>

      <button type="button" className="rest__skip" onClick={onDone}>
        Skip rest
      </button>
    </section>
  );
}
