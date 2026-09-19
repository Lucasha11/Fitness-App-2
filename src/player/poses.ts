import type { MascotName } from '../components/Mascot';
import type { Exercise, ExerciseSet } from '../exercises';
import { setExercises } from '../exercises';
import type { BodyRegion } from '../onboarding/state';

/**
 * Exercises that have their own drawn pose. Everything else falls back to its
 * body area's pose, so the catalogue can grow ahead of the illustrations.
 */
const POSE_BY_EXERCISE: Partial<Record<string, MascotName>> = {
  'neck-rolls': 'neckrolls',
  'spinal-twist': 'spinaltwist',
  'figure-four': 'figurefour',
  'hip-90-90': '9090',
  'standing-march': 'marching',
  'desk-squats': 'squats',
  // Added with the curated sets: these read correctly against an existing
  // drawing, so they do not fall back to the body area's generic pose.
  'overhead-reach': 'lifting',
  'triceps-stretch': 'lifting',
  'arm-swings': 'lifting',
  'wall-angels': 'lifting',
  'cat-cow': 'spinaltwist',
  'hip-opener': 'marching',
  'calf-raises': 'walking',
  'ankle-circles': '9090',
  'quad-stretch': 'figurefour',
  'side-bend': 'lifting',
  'pelvic-tilts': '9090',
};

/** Each body area gets a mascot pose, so the figure matches the movement. */
const POSE_BY_REGION: Record<BodyRegion, MascotName> = {
  neck: 'thumbsup',
  shoulders: 'pullups',
  upperBack: 'pullups',
  lowerBack: 'squats',
  wrists: 'thumbsup',
  hips: 'squats',
  eyes: 'water',
  lowEnergy: 'walking',
};

/** The tint behind a pose's thumbnail in the sequence overview. */
const TINT_BY_REGION: Record<BodyRegion, string> = {
  neck: 'var(--mint)',
  shoulders: 'var(--lime)',
  upperBack: 'var(--lime)',
  lowerBack: 'var(--mint)',
  wrists: 'oklch(0.68 0.075 282 / 35%)',
  hips: 'var(--mint)',
  eyes: 'oklch(0.68 0.075 282 / 35%)',
  lowEnergy: 'var(--lime)',
};

export function poseFor(exercise: Exercise): MascotName {
  return POSE_BY_EXERCISE[exercise.id] ?? POSE_BY_REGION[exercise.region];
}

/**
 * The pose on a curated set's tile.
 *
 * Hand-assigned rather than derived from the set's lead exercise: several
 * sets open with the same move, and two packs sharing one drawing on the same
 * shelf reads as a bug. Every set gets its own pose, and the test holds them
 * to it.
 */
const POSE_BY_SET: Record<string, MascotName> = {
  'desk-reset': 'walking',
  'neck-relief': 'neckrolls',
  posture: 'pullups',
  'wrists-hands': 'thumbsup',
  'lower-back': 'spinaltwist',
  'hips-glutes': 'figurefour',
  energizer: 'squats',
  'legs-circulation': 'marching',
  'eyes-reset': 'water',
  'arms-shoulders': 'lifting',
};

/**
 * A set's tile pose: its own if it has been given one, otherwise the first
 * pose drawn for one of its exercises, so a new set renders before anyone
 * has chosen its art.
 */
export function poseForSet(set: ExerciseSet): MascotName {
  const assigned = POSE_BY_SET[set.id];
  if (assigned) return assigned;

  const exercises = setExercises(set);
  const drawn = exercises.find((exercise) => POSE_BY_EXERCISE[exercise.id]);
  return poseFor(drawn ?? exercises[0]);
}

export function tintFor(region: BodyRegion): string {
  return TINT_BY_REGION[region];
}
