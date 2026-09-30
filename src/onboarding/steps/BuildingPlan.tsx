import { useEffect, useMemo, useState } from 'react';
import { CheckIcon } from '../../components/icons';
import { useCoachNoun } from '../../components/coach';
import { Mascot } from '../../components/Mascot';
import { Screen } from '../../components/ui';
import type { Visibility } from '../state';
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

/** How the first line describes the room the moves have to fit. */
const ROOM: Record<Visibility, string> = {
  private: 'a room of your own',
  some: 'a shared room',
  open: 'an open office',
};

export function BuildingPlan({ state, next }: StepProps) {
  // The lines name the user's own answers, so the wait reads as work being
  // done for them rather than as a generic spinner.
  const lines = useMemo(() => {
    const firstActive = state.activeDays.findIndex(Boolean);
    const weekday =
      firstActive === -1 ? 'week' : WEEKDAY_NAMES[firstActive];

    return [
      `Picking moves for ${ROOM[state.visibility]}…`,
      `Fitting them around your ${weekday}…`,
      'Hiding the ones you’d hate…',
    ];
  }, [state.visibility, state.activeDays]);

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

  const coach = useCoachNoun();
  const percent = Math.min(100, ((done + 0.6) / lines.length) * 100);

  return (
    <Screen tone="warm" className="build" labelledBy="building-title">
      <div className="bob">
        <Mascot
          name="armsout"
          size={250}
          alt={`Your ${coach} stretching while your plan builds`}
        />
      </div>

      <h1 className="build__title" id="building-title">
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
