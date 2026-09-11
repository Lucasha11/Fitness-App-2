import { createContext, useContext } from 'react';
import type { MascotName } from './Mascot';

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

/**
 * What the picker shows for each coach. Adding an animal here (with its art
 * in `Mascot`) is the whole job — A1b's carousel, its pager and its jump rail
 * all size themselves off this list.
 */
export interface CoachProfile {
  value: Coach;
  /** The name on the card. The lowercase form for copy is COACH_NOUN. */
  name: string;
  blurb: string;
  /** Two short words, the tone the coach speaks in. */
  traits: [string, string];
  /** The pose the card leads with. */
  pose: MascotName;
}

export const COACH_PROFILES: CoachProfile[] = [
  {
    value: 'panda',
    name: 'Panda',
    blurb: 'Calm, a bit smug about posture. Will wait all day for you to stand up.',
    traits: ['Gentle', 'Deadpan'],
    pose: 'thumbsup',
  },
  {
    value: 'squirrel',
    name: 'Squirrel',
    blurb: 'Caffeinated. Will not sit down, and does not believe you can either.',
    traits: ['Restless', 'Loud'],
    pose: 'thumbsup',
  },
];

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
