import { useRef, useState } from 'react';
import { ChevronDownIcon } from '../../components/icons';
import { TimeWheelSheet } from '../../components/TimeWheelSheet';
import {
  Button,
  Screen,
  ScreenBody,
  ScreenFooter,
  Spacer,
} from '../../components/ui';
import { CoachSays, StepHeader } from '../chrome';
import { DAY_INITIALS, scheduleSentence, splitTime } from '../state';
import type { StepProps } from '../types';

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/** The shortest sitting day the scheduler can put a break inside. */
const MIN_WINDOW = 30;
const LAST_MINUTE = 1439;

type Edited = 'start' | 'end';

export function Schedule({ state, set, next, back }: StepProps) {
  const [editing, setEditing] = useState<Edited | null>(null);
  const startCard = useRef<HTMLButtonElement>(null);
  const endCard = useRef<HTMLButtonElement>(null);

  const toggleDay = (index: number) => {
    set((current) => ({
      activeDays: current.activeDays.map((on, i) => (i === index ? !on : on)),
    }));
  };

  const start = splitTime(state.startMinutes);
  const end = splitTime(state.endMinutes);

  /**
   * Times are clamped so "ends" can never sit before "starts": whichever end
   * the wheels are moving wins, and the other is pushed out of the way.
   */
  const setStart = (minutes: number) => {
    const startMinutes = Math.min(minutes, LAST_MINUTE - MIN_WINDOW);
    set((current) => ({
      startMinutes,
      endMinutes: Math.max(current.endMinutes, startMinutes + MIN_WINDOW),
    }));
  };

  const setEnd = (minutes: number) => {
    const endMinutes = Math.max(minutes, MIN_WINDOW);
    set((current) => ({
      endMinutes,
      startMinutes: Math.min(current.startMinutes, endMinutes - MIN_WINDOW),
    }));
  };

  /** Closing hands focus back to the card that opened the sheet. */
  const closeSheet = () => {
    const opener = editing === 'start' ? startCard.current : endCard.current;
    setEditing(null);
    opener?.focus();
  };

  return (
    <Screen labelledBy="schedule-title">
      <StepHeader step="schedule" onBack={back} />

      <ScreenBody>
        <h1 className="title title--step" id="schedule-title">
          When are you sitting?
        </h1>

        <div className="days" role="group" aria-label="Active days">
          {DAY_INITIALS.map((initial, index) => (
            <button
              key={DAY_NAMES[index]}
              type="button"
              className="days__day"
              aria-pressed={state.activeDays[index]}
              aria-label={DAY_NAMES[index]}
              onClick={() => toggleDay(index)}
            >
              <span aria-hidden="true">{initial}</span>
            </button>
          ))}
        </div>

        <div className="times">
          <button
            ref={startCard}
            type="button"
            className="time-card"
            aria-label={`Sitting starts at ${start.clock} ${start.suffix}`}
            aria-haspopup="dialog"
            aria-expanded={editing === 'start'}
            onClick={() => setEditing('start')}
          >
            <span className="eyebrow">Starts</span>
            <span className="time-card__value">
              {start.clock} <span className="time-card__suffix">{start.suffix}</span>
            </span>
            <span className="time-card__caret" aria-hidden="true">
              <ChevronDownIcon size={15} />
            </span>
          </button>

          <button
            ref={endCard}
            type="button"
            className="time-card"
            aria-label={`Sitting ends at ${end.clock} ${end.suffix}`}
            aria-haspopup="dialog"
            aria-expanded={editing === 'end'}
            onClick={() => setEditing('end')}
          >
            <span className="eyebrow">Ends</span>
            <span className="time-card__value">
              {end.clock} <span className="time-card__suffix">{end.suffix}</span>
            </span>
            <span className="time-card__caret" aria-hidden="true">
              <ChevronDownIcon size={15} />
            </span>
          </button>
        </div>

        <Spacer />
        {/* The coach reads the schedule back, so a wrong day is caught here. */}
        <CoachSays pose="sit">{scheduleSentence(state)}</CoachSays>
      </ScreenBody>

      <ScreenFooter>
        <Button
          onClick={next}
          disabled={!state.activeDays.some(Boolean)}
        >
          Continue
        </Button>
      </ScreenFooter>

      {editing ? (
        <TimeWheelSheet
          title={editing === 'start' ? 'Sitting starts at' : 'Sitting ends at'}
          minutes={editing === 'start' ? state.startMinutes : state.endMinutes}
          onChange={editing === 'start' ? setStart : setEnd}
          onClose={closeSheet}
        />
      ) : null}
    </Screen>
  );
}
