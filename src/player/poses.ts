import type { MascotName } from '../components/Mascot';
import type { Exercise } from '../exercises';
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

export function tintFor(region: BodyRegion): string {
  return TINT_BY_REGION[region];
}
