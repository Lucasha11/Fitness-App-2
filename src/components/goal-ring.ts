/*
 * Segmented ring geometry.
 *
 * One arc per break: 62 units drawn, 28 units of gap, on a normalised path.
 * The geometry is identical whether the goal is 2 breaks or 12, and B1's daily
 * ring and A10's stepper ring are the same recipe at different sizes.
 */

const SEGMENT_DRAWN = 62;
const SEGMENT_GAP = 28;
const SEGMENT_TOTAL = SEGMENT_DRAWN + SEGMENT_GAP;

/** The dash pattern for an untouched track. */
export const TRACK_DASH = `${SEGMENT_DRAWN} ${SEGMENT_GAP}`;

export function segmentPathLength(goal: number): number {
  return goal * SEGMENT_TOTAL;
}

/**
 * The dash pattern that lights `done` of `goal` segments: that many arcs, then
 * one long gap so the rest of the ring is left to the track underneath.
 * Returns `null` at zero, because a zero-length dash still paints its cap.
 */
export function segmentDash(done: number, goal: number): string | null {
  const filled = Math.min(done, goal);
  if (filled === 0) return null;

  const trailing = segmentPathLength(goal) - filled * SEGMENT_TOTAL + SEGMENT_GAP;
  return `${`${TRACK_DASH} `.repeat(filled - 1)}${SEGMENT_DRAWN} ${trailing}`;
}
