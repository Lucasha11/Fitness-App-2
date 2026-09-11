import { useEffect, useMemo, useState } from 'react';
import { CheckIcon } from '../../components/icons';
import { Mascot } from '../../components/Mascot';
import { Screen } from '../../components/ui';
import { BODY_REGION_LABELS } from '../state';
import type { StepProps } from '../types';

/** How long each status line stays on screen before the next one ticks over. */
const LINE_MS = 850;

const WEEKDAY_NAMES = [
  'Mondays',
  'Tuesdays',
  'Wednesdays',
  'Thursdays',
  'Fridays',
  'Saturdays',
  'Sundays',
];

export function A14BuildingPlan({ state, next }: StepProps) {
  // The lines name the user's own answers, so the wait reads as work being
  // done for them rather than as a generic spinner.
  const lines = useMemo(() => {
    const focus = state.bothers[0]
      ? BODY_REGION_LABELS[state.bothers[0]].toLowerCase()
      : 'stiff afternoons';
    const firstActive = state.activeDays.findIndex(Boolean);
    const weekday =
      firstActive === -1 ? 'week' : WEEKDAY_NAMES[firstActive];

    return [
      `Picking exercises for your ${focus}…`,
      `Reading your ${weekday}…`,
      'Hiding the ones you’d hate…',
    ];
  }, [state.bothers, state.activeDays]);

  const [done, setDone] = useState(0);

  useEffect(() => {
    const count = lines.length;
    const ticks = Array.from({ length: count }, (_, index) =>
      window.setTimeout(() => setDone(index + 1), LINE_MS * (index + 1)),
    );
    const finish = window.setTimeout(next, LINE_MS * (count + 0.4));

    return () => {
      ticks.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
    // `next` is a stable callback from the flow controller, so the timers are
    // set up exactly once per visit to this screen.
  }, [lines, next]);

  const percent = Math.min(100, ((done + 0.6) / lines.length) * 100);

  return (
    <Screen tone="warm" className="build" labelledBy="a14-title">
      <div className="bob">
        <Mascot
          name="squats"
          size={250}
          alt="Panda stretching while your plan builds"
        />
      </div>

      <h1 className="build__title" id="a14-title">
        Building your plan
      </h1>

      <div className="build__lines" role="status" aria-live="polite">
        {lines.map((line, index) => {
          const complete = index < done;
          return (
            <div
              key={line}
              className={`build__line${complete ? '' : ' build__line--pending'}`}
            >
              {complete ? (
                <CheckIcon size={18} style={{ color: 'var(--lime)' }} />
              ) : (
                <span className="build__spinner" />
              )}
              {line}
            </div>
          );
        })}
      </div>

      <div className="build__bar" aria-hidden="true">
        <div className="build__bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </Screen>
  );
}
