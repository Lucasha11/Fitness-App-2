import type { ReactNode } from 'react';
import {
  CarIcon,
  CheckIcon,
  ClockIcon,
  GraduationIcon,
  HomeIcon,
  MonitorIcon,
  SofaIcon,
} from '../../components/icons';
import {
  Button,
  ProgressBar,
  Screen,
  ScreenBody,
  ScreenFooter,
  Spacer,
} from '../../components/ui';
import type { DayType } from '../state';
import { PROGRESS, type StepProps } from '../types';

const OPTIONS: { value: DayType; label: string; icon: ReactNode }[] = [
  { value: 'desk', label: 'Desk job', icon: <MonitorIcon /> },
  { value: 'hybrid', label: 'Hybrid', icon: <HomeIcon /> },
  { value: 'driver', label: 'Driver', icon: <CarIcon /> },
  { value: 'student', label: 'Student', icon: <GraduationIcon /> },
  { value: 'shift', label: 'Shift work', icon: <ClockIcon /> },
  { value: 'home', label: 'Mostly home', icon: <SofaIcon /> },
];

export function A3DayType({ state, set, next }: StepProps) {
  return (
    <Screen labelledBy="a3-title">
      <ProgressBar percent={PROGRESS.A3 ?? 0} />

      <ScreenBody>
        <h1 className="title" id="a3-title">
          What does your day look like?
        </h1>
        <p className="subtitle">Pick the closest one. You can change it later.</p>

        <div className="option-grid">
          {OPTIONS.map((option) => {
            const selected = state.dayType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className="option"
                aria-pressed={selected}
                onClick={() => set({ dayType: option.value })}
              >
                <span className="option__head">
                  {option.icon}
                  {selected ? <CheckIcon size={20} /> : null}
                </span>
                <span className="option__label">{option.label}</span>
              </button>
            );
          })}
        </div>

        <Spacer />
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next} disabled={state.dayType === null}>
          Continue
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
