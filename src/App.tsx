import { useCallback, useState } from 'react';
import type { Exercise } from './exercises';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import { loadState, type OnboardingState } from './onboarding/state';
import { pickExercises } from './schedule';
import { BreakPlayer } from './player/BreakPlayer';
import { LockScreenPreview } from './player/LockScreenPreview';
import { useSession } from './session/context';
import { SessionProvider } from './session/SessionProvider';
import type { Meeting } from './session/state';
import { Today } from './today/Today';

/**
 * Stand-in for the calendar the A12 screen offers to connect. Real EventKit
 * access isn't wired up yet, so a connected calendar seeds one meeting —
 * enough for the scheduler's "move the break into the gap" path, and for the
 * timeline's meeting row, to be exercised for real.
 */
const DEMO_MEETINGS: Meeting[] = [
  { start: 11 * 60, end: 11 * 60 + 45, title: 'Design standup' },
];

type View =
  | { name: 'onboarding' }
  | { name: 'today' }
  | { name: 'player'; lead: Exercise; slot: number | null }
  | { name: 'lockScreen' };

function Root() {
  const { seedMeetings } = useSession();
  const [answers, setAnswers] = useState<OnboardingState>(loadState);
  const [view, setView] = useState<View>(() => {
    // C10 is a reference mockup rather than a screen in the flow, so it lives
    // behind its own URL instead of anywhere in the navigation.
    if (window.location.hash === '#lock-screen') return { name: 'lockScreen' };
    return loadState().completedAt ? { name: 'today' } : { name: 'onboarding' };
  });

  const startBreak = useCallback((lead: Exercise, slot: number | null) => {
    setView({ name: 'player', lead, slot });
  }, []);

  const handleOnboardingComplete = useCallback(
    (completed: OnboardingState, options: { startBreak: boolean }) => {
      setAnswers(completed);
      seedMeetings(completed.calendarConnected ? DEMO_MEETINGS : []);

      if (options.startBreak) {
        setView({
          name: 'player',
          lead: pickExercises(completed, 1)[0],
          slot: null,
        });
        return;
      }
      setView({ name: 'today' });
    },
    [seedMeetings],
  );

  if (view.name === 'lockScreen') {
    return (
      <LockScreenPreview
        onExit={() => {
          window.location.hash = '';
          setView(
            answers.completedAt ? { name: 'today' } : { name: 'onboarding' },
          );
        }}
      />
    );
  }

  if (view.name === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (view.name === 'player') {
    return (
      <BreakPlayer
        answers={answers}
        lead={view.lead}
        slot={view.slot}
        onExit={() => setView({ name: 'today' })}
      />
    );
  }

  return <Today answers={answers} onStartBreak={startBreak} />;
}

export default function App() {
  return (
    <div className="app-stage">
      {/*
        On a phone this is the whole viewport; on a wide screen it becomes the
        390x844 artboard the design was drawn against.
      */}
      <main className="device">
        <SessionProvider>
          <Root />
        </SessionProvider>
      </main>
    </div>
  );
}
