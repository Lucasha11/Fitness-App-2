import { TRACK_DASH, segmentDash, segmentPathLength } from './goal-ring';
import './goal-ring.css';

/**
 * The segmented daily-goal ring from B1: each completed break is visibly its
 * own arc, so progress reads as a count rather than a percentage.
 */
export function GoalRing({ done, goal }: { done: number; goal: number }) {
  const pathLength = segmentPathLength(goal);
  const filled = segmentDash(done, goal);

  return (
    <div className="goal-ring">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="oklch(0.99 0.005 100 / 22%)"
          strokeWidth="16"
          strokeDasharray={TRACK_DASH}
          strokeLinecap="round"
          pathLength={pathLength}
        />
        {filled ? (
          <circle
            className="goal-ring__fill"
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke="var(--lime)"
            strokeWidth="16"
            strokeDasharray={filled}
            strokeLinecap="round"
            pathLength={pathLength}
          />
        ) : null}
      </svg>

      <div className="goal-ring__readout">
        <div className="goal-ring__count">
          {done}
          <span className="goal-ring__of">/{goal}</span>
        </div>
        <div className="goal-ring__label">BREAKS</div>
      </div>
    </div>
  );
}
