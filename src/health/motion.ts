import { registerPlugin } from '@capacitor/core';

export interface MotionStatus {
  /** Whether the device has an activity-tracking coprocessor at all. */
  available: boolean;
  authorized: boolean;
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
  isAvailable(): Promise<MotionStatus>;
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
    isAvailable: async () => ({ available: false, authorized: false }),
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
 * `since` keeps the query small: there is no point scanning back past the
 * moment the clock already started from.
 */
export async function readLastMovement(
  since: number,
): Promise<number | null> {
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
