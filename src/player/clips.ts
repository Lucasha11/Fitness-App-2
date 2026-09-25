import type { Exercise, ExerciseSet } from '../exercises';

/**
 * The panda's animated demonstrations: looping, transparent WebPs generated
 * from the keyframe poses and keyed by `scripts/panda-clips/key_clip.py`.
 *
 * A clip is live the moment its file lands in `src/assets/clips/` as
 * `panda-<exercise id>.webp` — there is no table to update. An exercise
 * without one keeps its drawn pose, so the catalogue can be animated a few
 * clips at a time. Only the panda is animated: the squirrel is retired (see
 * `COACHES`), and `ExerciseFigure` falls back to the still for any other coach
 * so a screen never shows one species' stills beside the other's clips.
 */
const CLIP_FILE = /(?:^|\/)panda-([a-z0-9-]+)\.webp$/;

/** `{ '…/panda-neck-rolls.webp': url }` -> `{ 'neck-rolls': url }`. */
export function clipsFromModules(modules: Record<string, string>): Map<string, string> {
  const clips = new Map<string, string>();
  for (const [path, url] of Object.entries(modules)) {
    const match = CLIP_FILE.exec(path);
    if (match) clips.set(match[1], url);
  }
  return clips;
}

const CLIPS = clipsFromModules(
  import.meta.glob<string>('../assets/clips/panda-*.webp', {
    eager: true,
    import: 'default',
  }),
);

/** The exercise ids that have a clip — the invariant test's view of the folder. */
export function clipIds(): string[] {
  return [...CLIPS.keys()];
}

export function clipFor(exercise: Exercise): string | undefined {
  return CLIPS.get(exercise.id);
}

/**
 * Which exercise a pack's shelf tile demonstrates.
 *
 * Hand-assigned for the same reason as `POSE_BY_SET`: sets share opening
 * moves, and two tiles on one shelf playing the same clip reads as a bug.
 * Each is a member of its own set, and no two sets share one.
 */
const CLIP_EXERCISE_BY_SET: Record<string, string> = {
  'desk-reset': 'shoulder-rolls',
  'neck-relief': 'neck-rolls',
  posture: 'blade-squeeze',
  'wrists-hands': 'wrist-circles',
  'lower-back': 'spinal-twist',
  'hips-glutes': 'figure-four',
  energizer: 'desk-squats',
  'legs-circulation': 'standing-march',
  'eyes-reset': 'twenty-foot-gaze',
  'arms-shoulders': 'arm-circles',
};

/** The exercise a set's tile demonstrates, or undefined for an unassigned set. */
export function clipExerciseIdForSet(set: ExerciseSet): string | undefined {
  return CLIP_EXERCISE_BY_SET[set.id];
}

export function clipForSet(set: ExerciseSet): string | undefined {
  const id = clipExerciseIdForSet(set);
  return id ? CLIPS.get(id) : undefined;
}
