import { registerPlugin } from '@capacitor/core';

export interface MotionStatus {
  /** Whether the device has an activity-tracking coprocessor at all. */
  available: boolean;
  authorized: boolean;
}

export interface MotionAvailability extends MotionStatus {
  /** `prompt` until Core Motion has asked; `denied` covers restricted too. */
  permission: 'granted' | 'denied' | 'prompt';
}

export interface LastMovement extends MotionStatus {
  /**
   * ISO timestamp of when the user's most recent movement ended — the moment
   * the current sitting stretch began. `null` when there is no reading:
   * unavailable hardware, a refused permission, or a history with no
   * confident movement in it.
   */
  movedAt: string | null;
}

export interface MotionPlugin {
  isAvailable(): Promise<MotionAvailability>;
  requestAuthorization(): Promise<MotionStatus>;
  lastMovedAt(options: { since?: string }): Promise<LastMovement>;
}

/**
 * Core Motion on iOS, and nothing anywhere else.
 *
 * The browser's DeviceMotion API only reports live acceleration while a page
 * is open, which cannot answer "did you get up while the app was closed?" —
 * so the web build reports unavailable rather than guessing.
 */
export const Motion = registerPlugin<MotionPlugin>('Motion', {
  web: async () => ({
    isAvailable: async () => ({
      available: false,
      authorized: false,
      permission: 'prompt' as const,
    }),
    requestAuthorization: async () => ({ available: false, authorized: false }),
    lastMovedAt: async () => ({
      available: false,
      authorized: false,
      movedAt: null,
    }),
  }),
});

/**
 * When the user last got up, as epoch ms, or `null` when motion can't say.
 *
 * `consented` is the user's movement-data preference. `since` keeps the
 * query small: there is no point scanning back past the moment the clock
 * already started from.
 */
export async function readLastMovement(
  consented: boolean,
  since: number,
): Promise<number | null> {
  // Checked here rather than only by the caller: this is the one door to Core
  // Motion, so a switched-off preference can never be read past.
  if (!consented) return null;

  try {
    const { available } = await Motion.isAvailable();
    if (!available) return null;

    await Motion.requestAuthorization();

    const { movedAt, authorized } = await Motion.lastMovedAt({
      since: new Date(since).toISOString(),
    });
    if (!authorized || !movedAt) return null;

    const parsed = Date.parse(movedAt);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    // A motion read failing should never take the Today screen down with it;
    // the clock just falls back to what the session already knows.
    return null;
  }
}

/**
 * Whether iOS is refusing MoveMate motion access. `false` on hardware without
 * Core Motion and before anyone has been asked, since neither is something the
 * user can fix in Settings.
 */
export async function motionDenied(): Promise<boolean> {
  try {
    const { available, permission } = await Motion.isAvailable();
    return available && permission === 'denied';
  } catch {
    return false;
  }
}

/** Shows Core Motion's prompt if it has never been shown. */
export async function requestMotion(): Promise<void> {
  try {
    const { available } = await Motion.isAvailable();
    if (available) await Motion.requestAuthorization();
  } catch {
    // The read path copes with no access; so does the toggle.
  }
}
