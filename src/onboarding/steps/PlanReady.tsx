import { useMemo } from 'react';
import { LockIcon } from '../../components/icons';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, ScreenBody, ScreenFooter } from '../../components/ui';
import { BREAK_DURATION_SECONDS, formatDurationShort } from '../../exercises';
import { previewNextBreaks } from '../../schedule';
import { useSession } from '../../session/context';
import { StepHeader } from '../chrome';
import {
  DAY_TYPE_LABELS,
  GOAL_TIERS,
  formatTime,
  tierForGoal,
} from '../state';
import type { StepProps } from '../types';

/** `9:00 AM` -> `9`, `5:30 PM` -> `5:30`, so the stat reads `9–5:30`. */
function compactTime(minutes: number): string {
  return formatTime(minutes)
    .replace(/\s(AM|PM)$/, '')
    .replace(/:00$/, '');
}

/** `2:15 PM` -> `2:15` — the narrow timeline rail drops the meridiem. */
function railTime(minutes: number): string {
  return formatTime(minutes).replace(/\s(AM|PM)$/, '');
}

/**
 * The finished plan, previewed with the same function Today uses, so what is
 * shown here is what the first day brings. It ends on the unlock rather than
 * in the app: the paywall sits between a built plan and its first break.
 */
export function PlanReady({ state, next, back }: StepProps) {
  const { session } = useSession();
  const plan = useMemo(
    () => previewNextBreaks(state, session),
    [state, session],
  );
  const tier = GOAL_TIERS.find((item) => item.id === tierForGoal(state.dailyGoal));

  return (
    <Screen labelledBy="ready-title">
      <StepHeader step="planReady" onBack={back} />

      <ScreenBody>
        <h1 className="title title--lg" id="ready-title">
          Your plan is ready
        </h1>

        <div className="card card--strong ready-card">
          <div className="chip-wrap ready-card__chips">
            {state.dayType ? (
              <span className="chip chip--static">{DAY_TYPE_LABELS[state.dayType]}</span>
            ) : null}
            {tier ? (
              <span className="chip chip--static chip--lime">{tier.name}</span>
            ) : null}
          </div>

          <div className="summary__stats">
            <div>
              <div className="summary__value">{state.dailyGoal}</div>
              <div className="summary__label">BREAKS A DAY</div>
            </div>
            <div>
              <div className="summary__value">
                {compactTime(state.startMinutes)}–{compactTime(state.endMinutes)}
              </div>
              <div className="summary__label">ACTIVE HOURS</div>
            </div>
          </div>
        </div>

        <h2 className="section-title">Today, from here</h2>

        <ul className="plan">
          {plan.map((slot) => (
            <li key={slot.at} className="plan__row">
              <span className="plan__time">{railTime(slot.at)}</span>
              <span className="plan__name">{slot.exercise.name}</span>
              <span className="plan__duration">
                {formatDurationShort(BREAK_DURATION_SECONDS)}
              </span>
            </li>
          ))}
        </ul>

        <div className="art-fill bob">
          <Mascot name="stride" size={150} />
        </div>
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next}>
          <span className="btn__with-icon">
            <LockIcon size={18} /> Unlock my plan
          </span>
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
