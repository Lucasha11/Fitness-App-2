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
  Screen,
  ScreenBody,
  ScreenFooter,
  Spacer,
} from '../../components/ui';
import { CoachSays, StepHeader } from '../chrome';
import { DAY_TYPE_LINES } from '../reactions';
import { DAY_TYPE_LABELS, DAY_TYPE_ORDER, type DayType } from '../state';
import type { StepProps } from '../types';

const ICONS: Record<DayType, ReactNode> = {
  desk: <MonitorIcon />,
  hybrid: <HomeIcon />,
  driver: <CarIcon />,
  student: <GraduationIcon />,
  shift: <ClockIcon />,
  home: <SofaIcon />,
};

export function DayTypeStep({ state, set, next, back }: StepProps) {
  return (
    <Screen labelledBy="daytype-title">
      <StepHeader step="dayType" onBack={back} />

      <ScreenBody>
        <h1 className="title title--step" id="daytype-title">
          What does your day look like?
        </h1>
        <p className="subtitle">Pick the closest one. You can change it later.</p>

        <div className="option-grid">
          {DAY_TYPE_ORDER.map((dayType) => {
            const selected = state.dayType === dayType;
            return (
              <button
                key={dayType}
                type="button"
                className="option"
                aria-pressed={selected}
                onClick={() => set({ dayType })}
              >
                <span className="option__head">
                  {ICONS[dayType]}
                  {selected ? <CheckIcon size={20} /> : null}
                </span>
                <span className="option__label">{DAY_TYPE_LABELS[dayType]}</span>
              </button>
            );
          })}
        </div>

        <Spacer />
        <CoachSays pose="hips">{DAY_TYPE_LINES[state.dayType ?? 'none']}</CoachSays>
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next} disabled={state.dayType === null}>
          Continue
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
