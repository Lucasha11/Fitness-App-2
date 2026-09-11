import { Mascot } from '../../components/Mascot';
import {
  Button,
  ProgressBar,
  Screen,
  ScreenBody,
  ScreenFooter,
  Spacer,
} from '../../components/ui';
import {
  DAY_INITIALS,
  fromTimeInputValue,
  scheduleSentence,
  splitTime,
  toTimeInputValue,
} from '../state';
import { PROGRESS, type StepProps } from '../types';

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function A8Schedule({ state, set, next }: StepProps) {
  const toggleDay = (index: number) => {
    set((current) => ({
      activeDays: current.activeDays.map((on, i) => (i === index ? !on : on)),
    }));
  };

  const start = splitTime(state.startMinutes);
  const end = splitTime(state.endMinutes);

  /** Times are clamped so "ends" can never sit before "starts". */
  const setStart = (value: string) => {
    const minutes = fromTimeInputValue(value);
    if (minutes === null) return;
    set((current) => ({
      startMinutes: minutes,
      endMinutes: Math.min(1439, Math.max(current.endMinutes, minutes + 30)),
    }));
  };

  const setEnd = (value: string) => {
    const minutes = fromTimeInputValue(value);
    if (minutes === null) return;
    set((current) => ({
      endMinutes: minutes,
      startMinutes: Math.max(0, Math.min(current.startMinutes, minutes - 30)),
    }));
  };

  return (
    <Screen labelledBy="a8-title">
      <ProgressBar percent={PROGRESS.A8 ?? 0} />

      <ScreenBody>
        <h1 className="title" id="a8-title">
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
          <label className="time-card">
            <span className="eyebrow">Starts</span>
            <span className="time-card__value">
              {start.clock} <span className="time-card__suffix">{start.suffix}</span>
            </span>
            <input
              className="time-card__input"
              type="time"
              aria-label="Sitting starts at"
              value={toTimeInputValue(state.startMinutes)}
              onChange={(event) => setStart(event.target.value)}
            />
          </label>

          <label className="time-card">
            <span className="eyebrow">Ends</span>
            <span className="time-card__value">
              {end.clock} <span className="time-card__suffix">{end.suffix}</span>
            </span>
            <input
              className="time-card__input"
              type="time"
              aria-label="Sitting ends at"
              value={toTimeInputValue(state.endMinutes)}
              onChange={(event) => setEnd(event.target.value)}
            />
          </label>
        </div>

        <p className="note a8__note" aria-live="polite">
          <Mascot name="water" size={44} />
          <span>{scheduleSentence(state)}</span>
        </p>

        <Spacer />
      </ScreenBody>

      <ScreenFooter>
        <Button
          onClick={next}
          disabled={!state.activeDays.some(Boolean)}
        >
          Continue
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
