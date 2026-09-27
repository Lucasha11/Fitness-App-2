import {
  EXERCISES,
  EXERCISE_SETS,
  setExercises,
  type Exercise,
} from '../exercises';
import {
  BODY_REGION_LABELS,
  BODY_REGION_ORDER,
  type BodyRegion,
} from '../onboarding/state';

/**
 * D1 · The library's grouping.
 *
 * An axis is a way of cutting the whole catalogue up. Picking one does not
 * filter the shelves, it replaces them: the library always shows everything,
 * and the axis only decides which heading a move ends up under. That is what
 * keeps "browse the library" from turning into "narrow the library down",
 * which is what the filters on Today already do.
 */
export type LibraryAxis = 'sets' | 'area' | 'setting';

export const LIBRARY_AXES: LibraryAxis[] = ['sets', 'area', 'setting'];

export const AXIS_LABELS: Record<LibraryAxis, string> = {
  sets: 'Sets',
  area: 'What hurts',
  setting: 'Where you are',
};

export interface LibraryShelf {
  id: string;
  title: string;
  exercises: Exercise[];
  /** Set the shelf came from, when the axis is `sets` — the row can be run. */
  setId?: string;
}

/**
 * A shelf needs two moves to earn its heading, the same bar Today's shelves
 * use: one card under a title reads as a row that failed to load.
 */
const SHELF_MINIMUM = 2;

/** Works seated and unnoticeably — the one setting the catalogue records. */
const SETTINGS: { id: string; title: string; subtle: boolean }[] = [
  { id: 'desk', title: 'At your desk', subtle: true },
  { id: 'standing', title: 'Standing room', subtle: false },
];

function byArea(): LibraryShelf[] {
  return BODY_REGION_ORDER.map((region: BodyRegion) => ({
    id: region,
    title: BODY_REGION_LABELS[region],
    exercises: EXERCISES.filter((exercise) => exercise.region === region),
  }));
}

function bySetting(): LibraryShelf[] {
  return SETTINGS.map((setting) => ({
    id: setting.id,
    title: setting.title,
    exercises: EXERCISES.filter(
      (exercise) => exercise.subtle === setting.subtle,
    ),
  }));
}

function bySet(): LibraryShelf[] {
  return EXERCISE_SETS.map((set) => ({
    id: set.id,
    title: set.name,
    exercises: setExercises(set),
    setId: set.id,
  }));
}

/**
 * The shelves for an axis, in the order the library shows them.
 *
 * Shelves short of `SHELF_MINIMUM` are dropped rather than rendered empty, so
 * the catalogue can grow a body area before it has the moves to fill it.
 */
export function shelvesFor(axis: LibraryAxis): LibraryShelf[] {
  const shelves =
    axis === 'area' ? byArea() : axis === 'setting' ? bySetting() : bySet();

  return shelves.filter((shelf) => shelf.exercises.length >= SHELF_MINIMUM);
}

/**
 * Moves matching what was typed, by name or by the name of the body area they
 * work. Searching "neck" has to find "Chin tucks", or the field only works
 * for people who already know what the move is called — which is the opposite
 * of what a library is for.
 */
export function searchExercises(query: string): Exercise[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return EXERCISES.filter((exercise) => {
    const area = BODY_REGION_LABELS[exercise.region].toLowerCase();
    return (
      exercise.name.toLowerCase().includes(needle) || area.includes(needle)
    );
  });
}
