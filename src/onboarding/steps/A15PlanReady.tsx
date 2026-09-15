import { useMemo } from 'react';
import { Mascot } from '../../components/Mascot';
import {
  Button,
  Screen,
  ScreenBody,
  ScreenFooter,
  TextButton,
} from '../../components/ui';
import { BREAK_DURATION_SECONDS, formatDurationShort } from '../../exercises';
import { previewNextBreaks } from '../../schedule';
import { useSession } from '../../session/context';
import { BODY_REGION_LABELS, formatTime } from '../state';
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

export function A15PlanReady({ state, finish }: StepProps) {
  const { session } = useSession();
  const plan = useMemo(
    () => previewNextBreaks(state, session),
    [state, session],
  );

  return (
    <Screen labelledBy="a15-title">
      <ScreenBody>
        <h1 className="title title--lg" id="a15-title" style={{ marginTop: 0 }}>
          Your plan is ready
        </h1>

        <div className="card card--strong" style={{ marginTop: 18 }}>
          <div className="chip-wrap" style={{ marginTop: 0, gap: 7 }}>
            {state.bothers.map((region) => (
              <span key={region} className="chip chip--static">
                {BODY_REGION_LABELS[region]}
              </span>
            ))}
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
          <Mascot name="thumbsup" size={160} />
        </div>
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={() => finish({ startBreak: true })}>
          Start my first break
        </Button>
        <TextButton onClick={() => finish({ startBreak: false })}>
          Take me to the app
        </TextButton>
      </ScreenFooter>
    </Screen>
  );
}
