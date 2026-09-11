import { createContext, useContext } from 'react';

/**
 * Which animal the coach is. The two asset sets are complete parallels, and
 * the design system is firm that a screen never mixes species — so the choice
 * lives in one context that every `Mascot` reads, rather than in a prop each
 * call site could get wrong.
 */
export type Coach = 'panda' | 'squirrel';

export const COACHES: Coach[] = ['panda', 'squirrel'];

/** The noun the copy uses, so a line reads "Your squirrel hates chairs". */
export const COACH_NOUN: Record<Coach, string> = {
  panda: 'panda',
  squirrel: 'squirrel',
};

/** Sentence-initial form, for alt text like "Squirrel coach". */
export const COACH_LABEL: Record<Coach, string> = {
  panda: 'Panda',
  squirrel: 'Squirrel',
};

/** The panda is the default coach, as shipped with the design. */
export const CoachContext = createContext<Coach>('panda');

export function useCoach(): Coach {
  return useContext(CoachContext);
}

/** `'panda'` / `'squirrel'`, for body copy that names the coach. */
export function useCoachNoun(): string {
  return COACH_NOUN[useCoach()];
}

export function nextCoach(coach: Coach): Coach {
  return COACHES[(COACHES.indexOf(coach) + 1) % COACHES.length];
}
