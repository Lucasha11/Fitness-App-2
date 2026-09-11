import { formatClock } from '../exercises';
import './player.css';

/** Circumference of the r=84 track the design draws, rounded as it is there. */
const RING_LENGTH = 528;

/**
 * C2's break timer: a thick ring that drains as the exercise runs, with the
 * remaining seconds large enough to read at arm's length across a desk.
 */
export function RingTimer({
  remaining,
  progress,
}: {
  remaining: number;
  /** 0 at the start of the exercise, 1 when it is up. */
  progress: number;
}) {
  return (
    <div className="player__timer">
      <div className="timer-ring">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="oklch(0.99 0.005 100 / 16%)"
            strokeWidth="20"
          />
          <circle
            className="timer-ring__fill"
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="var(--lime)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * progress}
          />
        </svg>

        <div className="timer-ring__readout">
          <div className="timer-ring__seconds">{remaining}</div>
          <div className="timer-ring__unit">SECONDS</div>
        </div>
      </div>
    </div>
  );
}

/**
 * The discreet-mode timer: the same countdown as a flat bar, because a large
 * animated ring is exactly what someone in an open office doesn't want.
 */
export function LinearTimer({
  name,
  remaining,
  progress,
}: {
  name: string;
  remaining: number;
  progress: number;
}) {
  return (
    <div className="player__bar-block">
      <div className="player__bar-labels">
        <span>{name}</span>
        <span>{formatClock(remaining)}</span>
      </div>
      <div
        className="player__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label={`${name} progress`}
      >
        <div
          className="player__bar-fill"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
