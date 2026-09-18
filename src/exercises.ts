/**
 * The exercise catalogue.
 *
 * Shared by onboarding's plan preview (A15), Today's timeline (B1) and the
 * break player (C2), so a break named on one screen is the same object with
 * the same duration and cues everywhere else.
 */

import type { BodyRegion } from './onboarding/state';

/** How long an exercise runs by default — the length the timeline badges,
 * the plan preview and a break nobody has shortened are all built around. */
export const EXERCISE_DURATION_SECONDS = 15;

/**
 * The per-exercise lengths the start screen's "reduce total time" control
 * offers, longest first. Four exercises at these lengths make a 1:00, 0:40 or
 * 0:20 break, so the control reads as a choice of total rather than of pace.
 */
export const EXERCISE_DURATION_CHOICES = [15, 10, 5] as const;

export type ExerciseDuration = (typeof EXERCISE_DURATION_CHOICES)[number];

/** Whether `seconds` is one of the lengths a break can actually run at. */
export function isExerciseDuration(seconds: number): seconds is ExerciseDuration {
  return (EXERCISE_DURATION_CHOICES as readonly number[]).includes(seconds);
}

/** Exercises in one break. Four at fifteen seconds is the one-minute break. */
export const EXERCISES_PER_BREAK = 4;

/** A whole break, end to end, in seconds. */
export const BREAK_DURATION_SECONDS =
  EXERCISES_PER_BREAK * EXERCISE_DURATION_SECONDS;

export interface Exercise {
  id: string;
  name: string;
  region: BodyRegion;
  /** Works seated and unnoticeably — the "open office" filter. */
  subtle: boolean;
  /** Worked one side at a time, so the player prompts a switch halfway. */
  sides?: boolean;
  /** Rotating coach lines shown under the animation during the break. */
  cues: string[];
}

export const EXERCISES: Exercise[] = [
  {
    id: 'neck-rolls',
    name: 'Neck rolls',
    region: 'neck',
    subtle: true,
    cues: ['Slow half circles', 'Chin towards your chest', 'Other way now'],
  },
  {
    id: 'neck-release',
    name: 'Neck release',
    region: 'neck',
    subtle: true,
    sides: true,
    cues: ['Ear towards your shoulder', 'Breathe out and soften', 'Let it lengthen'],
  },
  {
    id: 'shoulder-rolls',
    name: 'Shoulder rolls',
    region: 'shoulders',
    subtle: true,
    cues: ['Breathe out as you roll back', 'Big slow circles', 'Hold, 5 more seconds'],
  },
  {
    id: 'chest-opener',
    name: 'Doorway chest opener',
    region: 'shoulders',
    subtle: false,
    cues: ['Forearms on the frame', 'Step through gently', 'Keep your ribs down'],
  },
  {
    id: 'blade-squeeze',
    name: 'Shoulder blade squeeze',
    region: 'upperBack',
    subtle: true,
    cues: ['Pinch your shoulder blades', 'Hold for three', 'And release'],
  },
  {
    id: 'cat-cow',
    name: 'Cat-cow at the desk',
    region: 'upperBack',
    subtle: false,
    cues: ['Round through your back', 'Now open the chest', 'Follow your breath'],
  },
  {
    id: 'spinal-twist',
    name: 'Seated spinal twist',
    region: 'lowerBack',
    subtle: true,
    sides: true,
    cues: ['Hand on the chair back', 'Turn from the ribs', 'Breathe into it'],
  },
  {
    id: 'back-extension',
    name: 'Standing back extension',
    region: 'lowerBack',
    subtle: false,
    cues: ['Hands on your hips', 'Lean back gently', 'Only as far as feels good'],
  },
  {
    id: 'wrist-circles',
    name: 'Wrist circles',
    region: 'wrists',
    subtle: true,
    cues: ['Slow circles', 'Now the other direction', 'Shake them out'],
  },
  {
    id: 'wrist-stretch',
    name: 'Wrist & finger stretch',
    region: 'wrists',
    subtle: true,
    sides: true,
    cues: ['Fingers down, press gently', 'Now fingers up', 'Spread them wide'],
  },
  {
    id: 'figure-four',
    name: 'Seated figure four',
    region: 'hips',
    subtle: true,
    sides: true,
    cues: ['Ankle over the knee', 'Lean forward a little', 'Sink a bit deeper'],
  },
  {
    id: 'hip-90-90',
    name: '90/90 hip switch',
    region: 'hips',
    subtle: false,
    sides: true,
    cues: ['Both knees at ninety', 'Sit tall, chest up', 'Switch when it eases'],
  },
  {
    id: 'hip-opener',
    name: 'Standing hip opener',
    region: 'hips',
    subtle: false,
    sides: true,
    cues: ['Foot on the chair', 'Sink your weight down', 'Chest stays tall'],
  },
  {
    id: 'twenty-foot-gaze',
    name: 'Twenty-foot gaze',
    region: 'eyes',
    subtle: true,
    cues: ['Find something far away', 'Let your eyes relax', 'Blink it out'],
  },
  {
    id: 'eye-circles',
    name: 'Eye circles',
    region: 'eyes',
    subtle: true,
    cues: ['Trace a slow circle', 'Now the other way', 'Close and rest'],
  },
  {
    id: 'standing-march',
    name: 'Standing march',
    region: 'lowEnergy',
    subtle: false,
    cues: ['Knees up', 'Keep it light', 'Almost there'],
  },
  {
    id: 'desk-squats',
    name: 'Desk squats',
    region: 'lowEnergy',
    subtle: false,
    cues: ['Sit back, stand up', 'Chest tall', 'Nice and steady'],
  },
  {
    id: 'desk-push-offs',
    name: 'Desk push-offs',
    region: 'lowEnergy',
    subtle: true,
    cues: ['Hands on the desk edge', 'Slow and controlled', 'Five more'],
  },
  {
    id: 'chin-tucks',
    name: 'Chin tucks',
    region: 'neck',
    subtle: true,
    cues: ['Slide your chin straight back', 'Tall through the crown', 'Hold for three, release'],
  },
  {
    id: 'levator-stretch',
    name: 'Levator stretch',
    region: 'neck',
    subtle: true,
    sides: true,
    cues: ['Nose towards your armpit', 'Let that shoulder drop', 'Breathe, then switch'],
  },
  {
    id: 'shoulder-shrugs',
    name: 'Shoulder shrugs',
    region: 'shoulders',
    subtle: true,
    cues: ['Lift them to your ears', 'Hold at the top', 'Drop and breathe out'],
  },
  {
    id: 'arm-circles',
    name: 'Arm circles',
    region: 'shoulders',
    subtle: true,
    cues: ['Small circles forward', 'Let them grow', 'Now wind them back'],
  },
  {
    id: 'overhead-reach',
    name: 'Overhead reach',
    region: 'shoulders',
    subtle: true,
    cues: ['Reach for the ceiling', 'Lengthen one side', 'Keep your ribs down'],
  },
  {
    id: 'triceps-stretch',
    name: 'Triceps stretch',
    region: 'shoulders',
    subtle: true,
    sides: true,
    cues: ['Elbow up, hand down your back', 'Ease it over with the other hand', 'Switch when it eases'],
  },
  {
    id: 'wall-angels',
    name: 'Wall angels',
    region: 'upperBack',
    subtle: false,
    cues: ['Back flat against the wall', 'Slide your arms up', 'Keep the contact'],
  },
  {
    id: 'pelvic-tilts',
    name: 'Seated pelvic tilts',
    region: 'lowerBack',
    subtle: true,
    cues: ['Roll your hips back', 'Now tip them forward', 'Small and slow'],
  },
  {
    id: 'side-bend',
    name: 'Standing side bend',
    region: 'lowerBack',
    subtle: true,
    sides: true,
    cues: ['One arm overhead', 'Reach up and over', 'Switch when it eases'],
  },
  {
    id: 'prayer-stretch',
    name: 'Prayer stretch',
    region: 'wrists',
    subtle: true,
    cues: ['Palms together at your chest', 'Lower your hands slowly', 'Elbows stay wide'],
  },
  {
    id: 'nerve-glide',
    name: 'Nerve glide',
    region: 'wrists',
    subtle: true,
    sides: true,
    cues: ['Arm out, palm up', 'Tip your head away', 'Gently, never forced'],
  },
  {
    id: 'hip-flexor-lunge',
    name: 'Half-kneeling hip flexor',
    region: 'hips',
    subtle: false,
    sides: true,
    cues: ['One knee down, one up', 'Tuck your hips under', 'Squeeze the back glute'],
  },
  {
    id: 'quad-stretch',
    name: 'Standing quad stretch',
    region: 'hips',
    subtle: false,
    sides: true,
    cues: ['Heel towards your seat', 'Knees stay together', 'Hold the desk if you need'],
  },
  {
    id: 'palming',
    name: 'Palming',
    region: 'eyes',
    subtle: true,
    cues: ['Rub your palms warm', 'Cup them over your eyes', 'Just darkness, breathe'],
  },
  {
    id: 'ankle-circles',
    name: 'Ankle circles',
    region: 'lowEnergy',
    subtle: true,
    sides: true,
    cues: ['Lift one foot', 'Slow circles, both ways', 'Other foot now'],
  },
  {
    id: 'calf-raises',
    name: 'Calf raises',
    region: 'lowEnergy',
    subtle: true,
    cues: ['Up onto your toes', 'Pause at the top', 'Lower slowly'],
  },
  {
    id: 'arm-swings',
    name: 'Arm swings',
    region: 'lowEnergy',
    subtle: false,
    cues: ['Swing them wide', 'Cross them over', 'Keep it loose'],
  },
];

const BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

export function exerciseById(id: string): Exercise {
  const exercise = BY_ID.get(id);
  if (!exercise) throw new Error(`Unknown exercise: ${id}`);
  return exercise;
}

/**
 * A curated break: four exercises that belong together, in the order they
 * should be performed. The player prefers a set over composing a break from
 * scratch, and only falls back to `buildSequence`'s dynamic pool when the
 * user's filters knock members out.
 */
export interface ExerciseSet {
  id: string;
  name: string;
  /** One line for the intro screen, in the coach's voice. */
  blurb: string;
  /** Exactly `EXERCISES_PER_BREAK` ids, in running order. */
  exerciseIds: string[];
}

export const EXERCISE_SETS: ExerciseSet[] = [
  {
    id: 'desk-reset',
    name: 'Desk reset',
    blurb: 'The everyday one. Nothing here looks like exercising.',
    exerciseIds: ['neck-rolls', 'shoulder-rolls', 'wrist-circles', 'twenty-foot-gaze'],
  },
  {
    id: 'neck-relief',
    name: 'Neck relief',
    blurb: 'For the head that has been craned at a screen all morning.',
    exerciseIds: ['neck-rolls', 'neck-release', 'chin-tucks', 'levator-stretch'],
  },
  {
    id: 'posture',
    name: 'Posture & upper back',
    blurb: 'Undo the hunch. Chest open, shoulders back where they belong.',
    exerciseIds: ['blade-squeeze', 'cat-cow', 'wall-angels', 'chest-opener'],
  },
  {
    id: 'wrists-hands',
    name: 'Wrists & hands',
    blurb: 'The typist\u2019s set. Short, quiet, and worth doing often.',
    exerciseIds: ['wrist-circles', 'wrist-stretch', 'prayer-stretch', 'nerve-glide'],
  },
  {
    id: 'lower-back',
    name: 'Lower back',
    blurb: 'Twist, tilt, extend. The three things a chair never lets you do.',
    exerciseIds: ['spinal-twist', 'pelvic-tilts', 'back-extension', 'side-bend'],
  },
  {
    id: 'hips-glutes',
    name: 'Hips & glutes',
    blurb: 'Where sitting does its quietest damage.',
    exerciseIds: ['figure-four', 'hip-90-90', 'hip-opener', 'hip-flexor-lunge'],
  },
  {
    id: 'energizer',
    name: 'Standing energizer',
    blurb: 'Up and moving. The one for the three o\u2019clock slump.',
    exerciseIds: ['standing-march', 'desk-squats', 'calf-raises', 'arm-swings'],
  },
  {
    id: 'legs-circulation',
    name: 'Legs & circulation',
    blurb: 'Gentle, and exactly what long sits ask for.',
    exerciseIds: ['ankle-circles', 'calf-raises', 'standing-march', 'quad-stretch'],
  },
  {
    id: 'eyes-reset',
    name: 'Eyes & reset',
    blurb: 'Silent and still. Safe with the camera on.',
    exerciseIds: ['twenty-foot-gaze', 'eye-circles', 'palming', 'shoulder-shrugs'],
  },
  {
    id: 'arms-shoulders',
    name: 'Arms & shoulders',
    blurb: 'Seated, subtle, and it wakes the whole upper body up.',
    exerciseIds: ['arm-circles', 'overhead-reach', 'triceps-stretch', 'desk-push-offs'],
  },
];

// A set naming an exercise that does not exist, or running to the wrong
// length, is a build-time mistake — fail loudly at import rather than halfway
// through someone's break.
for (const set of EXERCISE_SETS) {
  if (set.exerciseIds.length !== EXERCISES_PER_BREAK) {
    throw new Error(
      `Exercise set ${set.id} has ${set.exerciseIds.length} exercises, expected ${EXERCISES_PER_BREAK}`,
    );
  }
  for (const id of set.exerciseIds) {
    if (!BY_ID.has(id)) {
      throw new Error(`Exercise set ${set.id} names an unknown exercise: ${id}`);
    }
  }
}

/** The set's exercises, resolved and in running order. */
export function setExercises(set: ExerciseSet): Exercise[] {
  return set.exerciseIds.map(exerciseById);
}

/** Every set that contains `id`, in catalogue order. */
export function setsContaining(id: string): ExerciseSet[] {
  return EXERCISE_SETS.filter((set) => set.exerciseIds.includes(id));
}

export function exercisesForRegion(region: BodyRegion): Exercise[] {
  return EXERCISES.filter((exercise) => exercise.region === region);
}

/** `45` -> `45 sec`, `60` -> `1 min`. */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  return seconds % 60 === 0 ? `${seconds / 60} min` : `${Math.round(seconds / 60)} min`;
}

/** The compact badge form used on the A15 timeline: `45s`, `1m`. */
export function formatDurationShort(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return seconds % 60 === 0 ? `${seconds / 60}m` : `${Math.round(seconds / 60)}m`;
}

/** `28` -> `0:28`. */
export function formatClock(seconds: number): string {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}
