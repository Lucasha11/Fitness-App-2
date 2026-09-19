import {
  EXERCISE_SETS,
  setExercises,
  type ExerciseSet,
} from '../exercises';
import type { BodyRegion, OnboardingState } from '../onboarding/state';
import { breaksThisWeek, type SessionState } from '../session/state';

/**
 * One row of pack tiles on Today. The shelves are the browsing half of the
 * screen: the plan tells the user what is due, the shelves let them pick
 * something else instead.
 */
export interface PackShelf {
  id: 'favourites' | 'bothers' | 'quiet' | 'uncovered';
  title: string;
  sets: ExerciseSet[];
}

/** No shelf runs longer than this — past it nobody scrolls sideways. */
const SHELF_LIMIT = 6;

/**
 * A shelf needs at least this many packs to earn its heading. One tile under
 * a title reads as a row that failed to load, and since an earlier shelf may
 * have claimed everything a later one wanted, that happens easily.
 */
const SHELF_MINIMUM = 2;

/** The body areas a set touches, across all four of its exercises. */
export function regionsOf(set: ExerciseSet): BodyRegion[] {
  return [...new Set(setExercises(set).map((exercise) => exercise.region))];
}

/** A set every one of whose exercises passes unnoticed on a video call. */
function isQuiet(set: ExerciseSet): boolean {
  return setExercises(set).every((exercise) => exercise.subtle);
}

/** How many of the user's sore areas a set covers. */
function bothersCovered(set: ExerciseSet, bothers: BodyRegion[]): number {
  return regionsOf(set).filter((region) => bothers.includes(region)).length;
}

/**
 * The shelves, in the order Today shows them.
 *
 * Favourites always comes back, empty or not: its empty state is the invite
 * to start hearting packs, so dropping the row would hide the feature from
 * everyone who has never used it. Every other shelf disappears unless it can
 * field a couple of packs, rather than sitting there as a heading over one
 * lonely tile.
 *
 * A pack appears on one shelf only. Recommending the same four exercises
 * three times over makes a screen look full while offering nothing new, so
 * the earliest shelf keeps it.
 */
export function buildShelves(
  answers: OnboardingState,
  session: SessionState,
  now: Date = new Date(),
): PackShelf[] {
  const spoken = new Set<string>();

  /** Takes the first `SHELF_LIMIT` sets no earlier shelf has claimed. */
  const claim = (sets: ExerciseSet[]): ExerciseSet[] => {
    const taken = sets.filter((set) => !spoken.has(set.id)).slice(0, SHELF_LIMIT);
    for (const set of taken) spoken.add(set.id);
    return taken;
  };

  const favourites: PackShelf = {
    id: 'favourites',
    title: 'Favourites',
    sets: claim(
      EXERCISE_SETS.filter((set) => session.favouriteSetIds.includes(set.id)),
    ),
  };

  const bothers = [...EXERCISE_SETS]
    .filter((set) => bothersCovered(set, answers.bothers) > 0)
    .sort(
      (a, b) =>
        bothersCovered(b, answers.bothers) - bothersCovered(a, answers.bothers),
    );

  const week = new Set(breaksThisWeek(session, now).map((entry) => entry.region));
  const uncovered = EXERCISE_SETS.filter((set) =>
    regionsOf(set).some((region) => !week.has(region)),
  );

  const rest: PackShelf[] = [
    { id: 'bothers', title: 'Because you’ve been sitting', sets: claim(bothers) },
    { id: 'quiet', title: 'Quiet, camera-on', sets: claim(EXERCISE_SETS.filter(isQuiet)) },
    { id: 'uncovered', title: 'Not covered this week', sets: claim(uncovered) },
  ];

  return [
    favourites,
    ...rest.filter((shelf) => shelf.sets.length >= SHELF_MINIMUM),
  ];
}
