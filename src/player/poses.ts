import type { MascotName } from '../components/Mascot';
import type { BodyRegion } from '../onboarding/state';

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

export function poseFor(region: BodyRegion): MascotName {
  return POSE_BY_REGION[region];
}

export function tintFor(region: BodyRegion): string {
  return TINT_BY_REGION[region];
}
