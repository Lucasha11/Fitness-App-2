/* ------------------------------------------------------------------ */
/* The next break's countdown, as the capsule says it                  */
/* ------------------------------------------------------------------ */

/**
 * `24` -> `NEXT BREAK IN 24 MIN`, `0` -> `BREAK DUE NOW`.
 *
 * The capsule's eyebrow carries the countdown now that the dial is gone, so
 * it has to read as a sentence rather than as a clock face — and the line
 * has one row beside the buttons, so it stays short enough not to wrap.
 */
export function countdownEyebrow(minutesAway: number): string {
  if (minutesAway <= 0) return 'BREAK DUE NOW';

  return `NEXT BREAK IN ${countdownLabel(minutesAway)}`;
}

/**
 * `24` -> `24 MIN`, `65` -> `1 HR`, `110` -> `2 HRS`.
 *
 * Past the hour the count rounds to the nearest whole one rather than
 * carrying the spare minutes: half an hour either way is inside the noise of
 * a plan that meetings push around anyway.
 */
export function countdownLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} MIN`;

  const hours = Math.round(minutes / 60);

  return `${hours} HR${hours === 1 ? '' : 'S'}`;
}
