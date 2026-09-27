import { useCallback, useEffect, useState } from 'react';
import { CoachProvider } from './components/CoachProvider';
import type { Tab } from './components/TabBar';
import type { Exercise } from './exercises';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import { loadState, saveState, type OnboardingState } from './onboarding/state';
import { pickExercises } from './schedule';
import { BreakPlayer } from './player/BreakPlayer';
import { LockScreenPreview } from './player/LockScreenPreview';
import { useReminders } from './reminders/useReminders';
import { SessionProvider } from './session/SessionProvider';
import { Settings } from './settings/Settings';
import { Today } from './today/Today';

type View =
  | { name: 'onboarding' }
  | { name: 'today' }
  | { name: 'settings' }
  | { name: 'player'; lead: Exercise; slot: number | null }
  | { name: 'lockScreen' };

function Root() {
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

  // Onboarding keeps its own copy while it runs and saves it on the way out,
  // so only a finished answer sheet is written back from here.
  useEffect(() => {
    if (answers.completedAt) saveState(answers);
  }, [answers]);

  const changeAnswers = useCallback((patch: Partial<OnboardingState>) => {
    setAnswers((current) => ({ ...current, ...patch }));
  }, []);

  const selectTab = useCallback((tab: Tab) => {
    setView(tab === 'you' ? { name: 'settings' } : { name: 'today' });
  }, []);

  useReminders(answers, startBreak);

  const handleOnboardingComplete = useCallback(
    (completed: OnboardingState, options: { startBreak: boolean }) => {
      setAnswers(completed);

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
    [],
  );

  // One provider over the whole app, so a screen can never mix species.
  // Onboarding nests its own while the user is still choosing on A1.
  return (
    <CoachProvider coach={answers.coach}>
      {renderView()}
    </CoachProvider>
  );

  function renderView() {
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

    if (view.name === 'settings') {
      return (
        <Settings
          answers={answers}
          onChangeAnswers={changeAnswers}
          onSelectTab={selectTab}
        />
      );
    }

    return (
      <Today
        answers={answers}
        onStartBreak={startBreak}
        onSelectTab={selectTab}
      />
    );
  }
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
