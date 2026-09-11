import type { OnboardingState } from './state';

/** The screens drawn in Onboarding.dc.html, in flow order. */
export type StepId =
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A5'
  | 'A6'
  | 'A7'
  | 'A8'
  | 'A9'
  | 'A10'
  | 'A11'
  | 'A12'
  | 'A13'
  | 'A14'
  | 'A15'
  | 'A17';

/** The linear spine of onboarding. A17 hangs off A1 and is not part of it. */
export const MAIN_FLOW: StepId[] = [
  'A1',
  'A2',
  'A3',
  'A5',
  'A6',
  'A7',
  'A8',
  'A9',
  'A10',
  'A11',
  'A12',
  'A13',
  'A14',
  'A15',
];

/**
 * Progress-rail percentages, copied from the canvas rather than computed, so
 * the bar advances with the same rhythm the design was reviewed at.
 * Screens absent from this map draw no rail.
 */
export const PROGRESS: Partial<Record<StepId, number>> = {
  A3: 20,
  A5: 36,
  A6: 44,
  A7: 52,
  A8: 62,
  A9: 72,
  A10: 80,
  A11: 86,
  A12: 90,
  A13: 94,
};

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
  /** Advance along MAIN_FLOW. */
  next: () => void;
  /** Pop back to the previously visited screen. */
  back: () => void;
  /** Jump to a specific screen (used for the A1 -> A17 detour). */
  go: (step: StepId) => void;
  /** Leave onboarding for Today, optionally straight into the first break. */
  finish: (options: { startBreak: boolean }) => void;
}
