/**
 * The backing track a break can play under the exercises.
 *
 * The plumbing is real — one looping element, owned here so a break that ends
 * any way at all still stops the audio — but no track ships yet, so
 * `TRACK_URL` is null and every call below is a well-behaved no-op. Dropping a
 * licensed loop into `src/assets` and importing it here is the only change
 * needed to make the "Play music" toggle audible; nothing that calls into this
 * module has to move.
 *
 * Kept apart from `cues.ts` on purpose: the cues are synthesised tones with no
 * asset and no loop, and they answer to a different switch.
 */

/** The loop a break plays under the exercises. Awaiting a licensed track. */
const TRACK_URL: string | null = null;

/** Quiet enough to coach over — the cues have to cut through it. */
const VOLUME = 0.35;

let element: HTMLAudioElement | null = null;

/** Whether there is a track to play at all, for UI that offers the toggle. */
export function musicAvailable(): boolean {
  return TRACK_URL !== null;
}

function audioElement(): HTMLAudioElement | null {
  if (TRACK_URL === null || typeof Audio === 'undefined') return null;
  if (!element) {
    element = new Audio(TRACK_URL);
    element.loop = true;
    element.volume = VOLUME;
    element.preload = 'auto';
  }
  return element;
}

/**
 * Start the loop, or carry on if it is already running.
 *
 * Browsers block playback until the user has tapped something; a break only
 * ever calls this after the start screen's button, so the promise rejecting is
 * a genuine failure rather than a policy one — and still not worth breaking
 * someone's break over.
 */
export function startMusic(): void {
  const audio = audioElement();
  if (!audio) return;
  void audio.play().catch(() => {
    /* No music this time; the break itself is unaffected. */
  });
}

/** Stop the loop and rewind, so the next break opens on the same bar. */
export function stopMusic(): void {
  if (!element) return;
  element.pause();
  element.currentTime = 0;
}
