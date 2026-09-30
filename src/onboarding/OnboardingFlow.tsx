import { useCallback, useEffect, useMemo, useState } from 'react';
import { CoachProvider } from '../components/CoachProvider';
import './onboarding.css';
import { type OnboardingState, loadState, saveState } from './state';
import { BetterDay } from './steps/BetterDay';
import { BuildingPlan } from './steps/BuildingPlan';
import { CoachPicker } from './steps/CoachPicker';
import { DayTypeStep } from './steps/DayType';
import { Difficulty } from './steps/Difficulty';
import { Frequency } from './steps/Frequency';
import { Hook } from './steps/Hook';
import { LevelAndNeeds } from './steps/LevelAndNeeds';
import { MotionHealth } from './steps/MotionHealth';
import { Notifications } from './steps/Notifications';
import { Paywall } from './steps/Paywall';
import { PlanReady } from './steps/PlanReady';
import { Schedule } from './steps/Schedule';
import { Scoreboard } from './steps/Scoreboard';
import { SignIn } from './steps/SignIn';
import { SittingHours } from './steps/SittingHours';
import { VisibilityStep } from './steps/Visibility';
import { Welcome } from './steps/Welcome';
import {
  nextStep,
  type AnswerPatch,
  type StepId,
  type StepProps,
} from './types';

const SCREENS: Record<StepId, (props: StepProps) => React.ReactElement> = {
  hook: Hook,
  sitting: SittingHours,
  scoreboard: Scoreboard,
  betterDay: BetterDay,
  dayType: DayTypeStep,
  visibility: VisibilityStep,
  level: LevelAndNeeds,
  schedule: Schedule,
  frequency: Frequency,
  difficulty: Difficulty,
  notifications: Notifications,
  motion: MotionHealth,
  building: BuildingPlan,
  planReady: PlanReady,
  paywall: Paywall,
  welcome: Welcome,
  signIn: SignIn,
  coach: CoachPicker,
};

/**
 * Screens that advance on their own. Back never lands on one, or it would
 * play again and carry the user straight forward to where they came from.
 */
const PASS_THROUGH: StepId[] = ['building'];

interface OnboardingFlowProps {
  /** Called once the user leaves the welcome screen for the rest of the app. */
  onComplete: (answers: OnboardingState, options: { startBreak: boolean }) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [answers, setAnswers] = useState<OnboardingState>(loadState);
  // A visit stack rather than an index, so Back works across the account
  // detour as well as along the main path.
  const [history, setHistory] = useState<StepId[]>(['hook']);

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
    setHistory((current) => [...current, target]);
  }, []);

  const next = useCallback(() => {
    setHistory((current) => {
      const following = nextStep(current[current.length - 1]);
      return following ? [...current, following] : current;
    });
  }, []);

  const back = useCallback(() => {
    setHistory((current) => {
      let trimmed = current.length > 1 ? current.slice(0, -1) : current;
      while (trimmed.length > 1 && PASS_THROUGH.includes(trimmed[trimmed.length - 1])) {
        trimmed = trimmed.slice(0, -1);
      }
      return trimmed;
    });
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

  // The live answer sheet is the one here, not the copy App is holding, so a
  // coach picked on the coach screen takes effect on the very next one.
  // Re-mount on every step so the entry animation replays and scroll resets.
  return (
    <CoachProvider coach={answers.coach}>
      <Screen key={step} {...props} />
    </CoachProvider>
  );
}
