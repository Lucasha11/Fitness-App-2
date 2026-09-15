/**
 * The exercise catalogue.
 *
 * Shared by onboarding's plan preview (A15), Today's timeline (B1) and the
 * break player (C2), so a break named on one screen is the same object with
 * the same duration and cues everywhere else.
 */

import type { BodyRegion } from './onboarding/state';

/** Every exercise runs for exactly this long — the break player, timeline
 * badges and cue pacing all read from this single constant. */
export const EXERCISE_DURATION_SECONDS = 15;

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
];

const BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

export function exerciseById(id: string): Exercise {
  const exercise = BY_ID.get(id);
  if (!exercise) throw new Error(`Unknown exercise: ${id}`);
  return exercise;
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
