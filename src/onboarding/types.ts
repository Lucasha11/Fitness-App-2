import type { OnboardingState } from './state';

/**
 * Every screen onboarding can show. The flow reads as four chapters: the
 * ache the user feels, the fix MoveMate offers, the plan built from their
 * answers, and the unlock that puts the plan to work.
 */
export type StepId =
  | 'hook'
  | 'sitting'
  | 'scoreboard'
  | 'betterDay'
  | 'dayType'
  | 'visibility'
  | 'level'
  | 'schedule'
  | 'frequency'
  | 'difficulty'
  | 'notifications'
  | 'motion'
  | 'building'
  | 'planReady'
  | 'paywall'
  | 'welcome'
  // Off the main path: the account detour from the hook, and the coach
  // picker, which waits for a second coach to rejoin COACHES.
  | 'signIn'
  | 'coach';

export type ChapterId = 'ache' | 'fix' | 'plan' | 'unlock';

/** The stops on the trail, in order. The label is what the trail prints. */
export const CHAPTERS: { id: ChapterId; label: string }[] = [
  { id: 'ache', label: 'The ache' },
  { id: 'fix', label: 'The fix' },
  { id: 'plan', label: 'Your plan' },
  { id: 'unlock', label: 'Unlock' },
];

interface FlowStep {
  id: StepId;
  chapter: ChapterId;
  /** A question the plan is built from, numbered on screen. */
  asks?: true;
}

/** The main path, in order. */
export const FLOW: FlowStep[] = [
  { id: 'hook', chapter: 'ache' },
  { id: 'sitting', chapter: 'ache' },
  { id: 'scoreboard', chapter: 'ache' },
  { id: 'betterDay', chapter: 'fix' },
  { id: 'dayType', chapter: 'plan', asks: true },
  { id: 'visibility', chapter: 'plan', asks: true },
  { id: 'level', chapter: 'plan', asks: true },
  { id: 'schedule', chapter: 'plan', asks: true },
  { id: 'frequency', chapter: 'plan', asks: true },
  { id: 'difficulty', chapter: 'plan', asks: true },
  { id: 'notifications', chapter: 'plan' },
  { id: 'motion', chapter: 'plan' },
  { id: 'building', chapter: 'plan' },
  { id: 'planReady', chapter: 'plan' },
  { id: 'paywall', chapter: 'unlock' },
  { id: 'welcome', chapter: 'unlock' },
];

/** The step after this one on the main path, or null at the end or off it. */
export function nextStep(id: StepId): StepId | null {
  const index = FLOW.findIndex((step) => step.id === id);
  if (index === -1 || index === FLOW.length - 1) return null;
  return FLOW[index + 1].id;
}

/** Which trail stop a step sits at, or null for a step off the main path. */
export function chapterIndex(id: StepId): number | null {
  const step = FLOW.find((item) => item.id === id);
  if (!step) return null;
  return CHAPTERS.findIndex((chapter) => chapter.id === step.chapter);
}

/** "Question 2 of 6" for a numbered question, null for any other step. */
export function questionNumber(id: StepId): { n: number; of: number } | null {
  const questions = FLOW.filter((step) => step.asks);
  const index = questions.findIndex((step) => step.id === id);
  if (index === -1) return null;
  return { n: index + 1, of: questions.length };
}

/**
 * A patch is either a plain object or a function of the current answers.
 * Use the function form whenever the new value derives from the old one, so
 * two taps in the same frame can't collapse into one.
 */
export type AnswerPatch =
  | Partial<OnboardingState>
  | ((current: OnboardingState) => Partial<OnboardingState>);

export interface StepProps {
  state: OnboardingState;
  /** Merge a partial answer into the sheet. */
  set: (patch: AnswerPatch) => void;
  /** Advance along the main path. */
  next: () => void;
  /** Pop back to the previously visited screen. */
  back: () => void;
  /** Jump to a specific screen (the hook's account detour). */
  go: (step: StepId) => void;
  /** Leave onboarding for Today, optionally straight into the first break. */
  finish: (options: { startBreak: boolean }) => void;
}
