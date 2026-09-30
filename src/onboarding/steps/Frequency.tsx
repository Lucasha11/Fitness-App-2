import {
  Button,
  Screen,
  ScreenBody,
  ScreenFooter,
  Segmented,
  Spacer,
} from '../../components/ui';
import {
  breaksPerDay,
  formatTime,
  movementMinutes,
  previewOffsets,
  type Interval,
} from '../state';
import { CoachSays, StepHeader } from '../chrome';
import { INTERVAL_LINES } from '../reactions';
import type { StepProps } from '../types';

const INTERVALS: { value: Interval; label: string }[] = [
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '60m' },
  { value: 90, label: '90m' },
];

export function Frequency({ state, set, next, back }: StepProps) {
  const isAuto = state.interval === 'auto';
  const breaks = breaksPerDay(state);
  const minutes = movementMinutes(breaks);
  const offsets = previewOffsets(breaks);
  const midpoint = formatTime(
    Math.round((state.startMinutes + state.endMinutes) / 2),
  );

  return (
    <Screen labelledBy="frequency-title">
      <StepHeader step="frequency" onBack={back} />

      <ScreenBody>
        <h1 className="title title--step" id="frequency-title">
          How often should we nudge?
        </h1>

        <div style={{ marginTop: 20 }}>
          <Segmented
            tight
            label="Break interval"
            options={INTERVALS}
            value={isAuto ? null : state.interval}
            onChange={(interval) => set({ interval })}
          />
        </div>

        <button
          type="button"
          className="auto-pill"
          aria-pressed={isAuto}
          onClick={() => set({ interval: 'auto' })}
        >
          Let MoveMate decide
        </button>

        <div className="card" style={{ marginTop: 22 }}>
          <span className="eyebrow">Today would look like</span>

          <div className="rail" aria-hidden="true">
            <div className="rail__line" />
            {offsets.map((offset, index) => (
              <span
                key={index}
                className="rail__dot"
                style={{ left: `${offset}%` }}
              />
            ))}
          </div>

          {/* On-the-hour times drop the `:00`, the way the design writes them. */}
          <div className="rail__scale">
            <span>{formatTime(state.startMinutes).replace(':00', '')}</span>
            <span>{midpoint.replace(':00', '')}</span>
            <span>{formatTime(state.endMinutes).replace(':00', '')}</span>
          </div>

          <p className="rail__summary" aria-live="polite">
            That’s about {breaks} break{breaks === 1 ? '' : 's'} a day,
            roughly {minutes} minute{minutes === 1 ? '' : 's'} of movement.
          </p>
        </div>

        <Spacer />
        <CoachSays pose="wave">{INTERVAL_LINES[state.interval]}</CoachSays>
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next}>Continue</Button>
      </ScreenFooter>
    </Screen>
  );
}
