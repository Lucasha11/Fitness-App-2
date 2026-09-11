import {
  TRACK_DASH,
  segmentDash,
  segmentPathLength,
} from '../../components/goal-ring';
import { MinusIcon, PlusIcon } from '../../components/icons';
import {
  Button,
  ProgressBar,
  Screen,
  ScreenFooter,
} from '../../components/ui';
import { movementMinutes } from '../state';
import { PROGRESS, type StepProps } from '../types';

const MIN_GOAL = 2;
const MAX_GOAL = 12;

export function A10Goal({ state, set, next }: StepProps) {
  const goal = state.dailyGoal;
  // Same segmented-ring recipe as B1's daily goal, at stepper size.
  const pathLength = segmentPathLength(goal);
  const filled = segmentDash(goal, goal) ?? '';

  return (
    <Screen tone="plain" labelledBy="a10-title">
      <ProgressBar percent={PROGRESS.A10 ?? 0} />

      <h1 className="title" id="a10-title">
        Set your daily goal
      </h1>
      <p className="subtitle">Nudge it any time — it’s a target, not a contract.</p>

      <div className="goal">
        <div className="goal__ring">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke="var(--fill)"
              strokeWidth="18"
              strokeDasharray={TRACK_DASH}
              strokeLinecap="round"
              pathLength={pathLength}
            />
            <circle
              className="goal__ring-fill"
              cx="100"
              cy="100"
              r="86"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="18"
              strokeDasharray={filled}
              strokeLinecap="round"
              pathLength={pathLength}
            />
          </svg>

          <div className="goal__readout">
            <div className="goal__number">{goal}</div>
            <div className="goal__unit">BREAKS A DAY</div>
          </div>
        </div>

        <div className="stepper">
          <button
            type="button"
            className="stepper__btn"
            aria-label="One fewer break"
            disabled={goal <= MIN_GOAL}
            onClick={() =>
              set((current) => ({
                dailyGoal: Math.max(MIN_GOAL, current.dailyGoal - 1),
              }))
            }
          >
            <MinusIcon size={24} />
          </button>

          <span className="stepper__caption" aria-live="polite">
            about {movementMinutes(goal)} min of moving
          </span>

          <button
            type="button"
            className="stepper__btn stepper__btn--accent"
            aria-label="One more break"
            disabled={goal >= MAX_GOAL}
            onClick={() =>
              set((current) => ({
                dailyGoal: Math.min(MAX_GOAL, current.dailyGoal + 1),
              }))
            }
          >
            <PlusIcon size={24} />
          </button>
        </div>
      </div>

      <ScreenFooter>
        <Button onClick={next}>Looks good</Button>
      </ScreenFooter>
    </Screen>
  );
}
