import { COACH_LABEL, COACH_NOUN, useCoach } from '../../components/coach';
import { ChairIcon, PersonIcon } from '../../components/icons';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, ScreenBody, ScreenFooter } from '../../components/ui';
import { StepHeader } from '../chrome';
import {
  activeSpanMinutes,
  formatTime,
  movementMinutes,
} from '../state';
import type { StepProps } from '../types';

/** `510` -> `8 h 30 m`, `480` -> `8 h`. */
function hoursAndMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} m` : `${hours} h`;
}

/** `9:00 AM` -> `9 AM`, the way a rail's end labels read. */
function railLabel(minutes: number): string {
  return formatTime(minutes).replace(':00', '');
}

/**
 * The fix, drawn on the user's clock. Nothing has been asked about their day
 * yet, so this is the default day; the plan chapter then makes it theirs.
 */
export function BetterDay({ state, next, back }: StepProps) {
  const coach = useCoach();
  const breaks = state.dailyGoal;
  // Evenly through the day with a gap at either end: nobody is nudged the
  // minute they sit down or the minute they leave.
  const offsets = Array.from(
    { length: breaks },
    (_, index) => ((index + 1) / (breaks + 1)) * 100,
  );
  const span = activeSpanMinutes(state);
  const start = railLabel(state.startMinutes);
  const end = railLabel(state.endMinutes);

  return (
    <Screen labelledBy="better-title">
      <StepHeader step="betterDay" onBack={back} />

      <ScreenBody>
        <h1 className="title" id="better-title">
          Same desk. Better day.
        </h1>
        <p className="subtitle">Nothing about your job changes. Just the gaps.</p>

        <div className="card day-compare day-compare--before">
          <div className="day-compare__head">
            <span className="eyebrow">A normal day</span>
            <span className="day-compare__verdict">
              <ChairIcon size={15} /> Chair wins
            </span>
          </div>
          <div className="day-compare__rail" aria-hidden="true">
            <span className="day-compare__block" style={{ left: 0, right: 0 }} />
          </div>
          <div className="day-compare__scale">
            <span>{start}</span>
            <span>{hoursAndMinutes(span)} without standing</span>
            <span>{end}</span>
          </div>
        </div>

        <div className="card card--strong day-compare">
          <div className="day-compare__head">
            <span className="eyebrow">With MoveMate</span>
            <span className="day-compare__verdict day-compare__verdict--you">
              <PersonIcon size={15} /> You win
            </span>
          </div>
          <div className="day-compare__rail" aria-hidden="true">
            {[...offsets, 100].map((at, index) => (
              <span
                key={at}
                className="day-compare__block"
                style={{
                  left: `${index === 0 ? 0 : offsets[index - 1] + 2}%`,
                  right: `${at === 100 ? 0 : 100 - at + 2}%`,
                }}
              />
            ))}
            {offsets.map((at) => (
              <span key={`break-${at}`} className="day-compare__break" style={{ left: `${at}%` }} />
            ))}
          </div>
          <div className="day-compare__scale">
            <span>{start}</span>
            <span>A minute up, {breaks} times a day</span>
            <span>{end}</span>
          </div>
          <div className="summary__stats day-compare__stats">
            <div>
              <div className="summary__value">{breaks}</div>
              <div className="summary__label">BREAKS</div>
            </div>
            <div>
              <div className="summary__value">{movementMinutes(breaks)} min</div>
              <div className="summary__label">MOVING</div>
            </div>
            <div>
              <div className="summary__value">0</div>
              <div className="summary__label">GYM TRIPS</div>
            </div>
          </div>
        </div>

        <div className="intro">
          <div className="intro__art bob">
            <Mascot name="wave" size={150} alt={`${COACH_LABEL[coach]} coach waving`} />
          </div>
          <p className="intro__bubble">
            I&rsquo;m your {COACH_NOUN[coach]}. {movementMinutes(breaks)}&nbsp;minutes
            a day is shorter than the coffee queue.
          </p>
        </div>
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next}>Build my plan</Button>
      </ScreenFooter>
    </Screen>
  );
}
