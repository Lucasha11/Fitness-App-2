import { useCallback, useEffect, useMemo, useState } from 'react';
import { CoachProvider } from '../components/CoachProvider';
import './onboarding.css';
import {
  type OnboardingState,
  clearState,
  initialState,
  loadState,
  saveState,
} from './state';
import { A1Welcome } from './steps/A1Welcome';
import { A1bCoach } from './steps/A1bCoach';
import { A2ValueCarousel } from './steps/A2ValueCarousel';
import { A3DayType } from './steps/A3DayType';
import { A5Bothers } from './steps/A5Bothers';
import { A6Visibility } from './steps/A6Visibility';
import { A7LevelAndNeeds } from './steps/A7LevelAndNeeds';
import { A8Schedule } from './steps/A8Schedule';
import { A9Frequency } from './steps/A9Frequency';
import { A10Goal } from './steps/A10Goal';
import { A11Notifications } from './steps/A11Notifications';
import { A13MotionHealth } from './steps/A13MotionHealth';
import { A14BuildingPlan } from './steps/A14BuildingPlan';
import { A15PlanReady } from './steps/A15PlanReady';
import { A17SignIn } from './steps/A17SignIn';
import {
  MAIN_FLOW,
  type AnswerPatch,
  type StepId,
  type StepProps,
} from './types';

const SCREENS: Record<StepId, (props: StepProps) => React.ReactElement> = {
  A1: A1Welcome,
  A1b: A1bCoach,
  A2: A2ValueCarousel,
  A3: A3DayType,
  A5: A5Bothers,
  A6: A6Visibility,
  A7: A7LevelAndNeeds,
  A8: A8Schedule,
  A9: A9Frequency,
  A10: A10Goal,
  A11: A11Notifications,
  A13: A13MotionHealth,
  A14: A14BuildingPlan,
  A15: A15PlanReady,
  A17: A17SignIn,
};

interface OnboardingFlowProps {
  /** Called once the user leaves A15 for the rest of the app. */
  onComplete: (answers: OnboardingState, options: { startBreak: boolean }) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [answers, setAnswers] = useState<OnboardingState>(loadState);
  // A visit stack rather than an index, so Back works across the A1 -> A17
  // detour as well as along the main flow.
  const [history, setHistory] = useState<StepId[]>(['A1']);

  const step = history[history.length - 1];

  useEffect(() => {
    saveState(answers);
  }, [answers]);

  const set = useCallback((patch: AnswerPatch) => {
    setAnswers((current) => ({
      ...current,
      ...(typeof patch === 'function' ? patch(current) : patch),
    }));
  }, []);

  const go = useCallback((target: StepId) => {
    if (target === 'A1') {
      // Restarting is a genuine reset, not another entry on the stack.
      clearState();
      setAnswers(initialState);
      setHistory(['A1']);
      return;
    }
    setHistory((current) => [...current, target]);
  }, []);

  const next = useCallback(() => {
    setHistory((current) => {
      const index = MAIN_FLOW.indexOf(current[current.length - 1]);
      if (index === -1 || index === MAIN_FLOW.length - 1) return current;
      return [...current, MAIN_FLOW[index + 1]];
    });
  }, []);

  const back = useCallback(() => {
    setHistory((current) =>
      current.length > 1 ? current.slice(0, -1) : current,
    );
  }, []);

  const finish = useCallback(
    (options: { startBreak: boolean }) => {
      const completed = { ...answers, completedAt: new Date().toISOString() };
      setAnswers(completed);
      saveState(completed);
      onComplete(completed, options);
    },
    [answers, onComplete],
  );

  const props = useMemo<StepProps>(
    () => ({ state: answers, set, next, back, go, finish }),
    [answers, set, next, back, go, finish],
  );

  const Screen = SCREENS[step];

  // The live answer sheet is the one here, not the copy App is holding, so
  // the coach A1 picks takes effect on the very next screen.
  // Re-mount on every step so the entry animation replays and scroll resets.
  return (
    <CoachProvider coach={answers.coach}>
      <Screen key={step} {...props} />
    </CoachProvider>
  );
}
