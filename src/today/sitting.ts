/* ------------------------------------------------------------------ */
/* The sitting clock, as the header says it                            */
/* ------------------------------------------------------------------ */

/**
 * `45` -> `45 minutes`, `95` -> `1 hour`, `500` -> `8 hours`.
 *
 * Past the hour the minutes stop being something anyone reads at a glance,
 * and a headline that changes every minute reads as a ticker rather than a
 * nudge — so an hour in, the count rounds down to whole hours and stays put.
 */
export function sittingLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(minutes / 60);

  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

/**
 * The header's line while the day's first break is still owed. It never
 * scolds: the clock is a fact, and getting up just now is worth a nod.
 */
export function sittingHeadline(minutes: number): string {
  if (minutes < 1) return 'You just got up — nice one.';

  return `You’ve been sitting for ${sittingLabel(minutes)}.`;
}
