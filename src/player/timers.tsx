import { formatClock } from '../exercises';
import './player.css';

/**
 * The grove screen's timer: the time left as a clock, large enough to read at
 * arm's length across a desk, over a thin bar that fills as the exercise
 * runs. It sits inside the frosted card, so it stays quiet enough not to
 * compete with the demonstration above it.
 */
export function ClockTimer({
  name,
  remaining,
  progress,
}: {
  name: string;
  remaining: number;
  /** 0 at the start of the exercise, 1 when it is up. */
  progress: number;
}) {
  return (
    <div className="player__clock">
      <div className="player__clock-readout">{formatClock(remaining)}</div>
      <div
        className="player__clock-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label={`${name} progress`}
      >
        <div
          className="player__clock-fill"
          style={{ width: `${progress * 100}%` }}
        />
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
