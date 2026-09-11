import { LockIcon } from '../../components/icons';
import {
  Button,
  ProgressBar,
  Screen,
  ScreenBody,
  ScreenFooter,
  Spacer,
  TextButton,
} from '../../components/ui';
import { PROGRESS, type StepProps } from '../types';

/** Meeting blocks, as percentages of the day rail. */
const MEETINGS = [
  { left: 22, width: 26 },
  { left: 62, width: 20 },
];

/** Where nudges land with no calendar: two of them talk over a meeting. */
const WITHOUT = [
  { left: 10, clash: false },
  { left: 30, clash: true },
  { left: 68, clash: true },
  { left: 88, clash: false },
];

/** The same day once the gaps are known. */
const WITH = [{ left: 10 }, { left: 52 }, { left: 85 }];

function Rail({
  label,
  dots,
  spaced = false,
}: {
  label: string;
  dots: { left: number; clash?: boolean }[];
  spaced?: boolean;
}) {
  return (
    <>
      <span className={`eyebrow${spaced ? ' tl__label' : ''}`}>{label}</span>
      <div className="tl" aria-hidden="true">
        <div className="tl__track" />
        {MEETINGS.map((meeting) => (
          <div
            key={meeting.left}
            className="tl__meeting"
            style={{ left: `${meeting.left}%`, width: `${meeting.width}%` }}
          />
        ))}
        {dots.map((dot) => (
          <span
            key={dot.left}
            className={`tl__dot${dot.clash ? ' tl__dot--clash' : ''}`}
            style={{ left: `${dot.left}%` }}
          />
        ))}
      </div>
    </>
  );
}

export function A12Calendar({ set, next }: StepProps) {
  return (
    <Screen labelledBy="a12-title">
      <ProgressBar percent={PROGRESS.A12 ?? 0} />

      <ScreenBody>
        <h1 className="title" id="a12-title">
          Never mid-meeting
        </h1>
        <p className="subtitle subtitle--lg">
          We slot breaks into the gaps instead of talking over your standup.
        </p>

        <div
          className="card"
          style={{ marginTop: 24 }}
          role="img"
          aria-label="Without a calendar, two of four breaks land on top of meetings. With a calendar, all three breaks land in the gaps."
        >
          <Rail label="Without calendar" dots={WITHOUT} />
          <Rail label="With calendar" dots={WITH} spaced />
        </div>

        <p className="note note--privacy" style={{ marginTop: 16 }}>
          <LockIcon size={20} />
          <span>We only read event times. Never titles, guests, or notes.</span>
        </p>

        <Spacer />
      </ScreenBody>

      <ScreenFooter>
        <Button
          onClick={() => {
            set({ calendarConnected: true });
            next();
          }}
        >
          Connect calendar
        </Button>
        <TextButton onClick={next}>Maybe later</TextButton>
      </ScreenFooter>
    </Screen>
  );
}
