import { useEffect } from 'react';
import { useSession } from '../session/context';
import { readLastMovement } from './motion';

/** How often to re-read the activity log while the app is on screen. */
const POLL_MS = 60_000;

/**
 * Keeps the sitting clock honest by asking Core Motion when the user last got
 * up, and resetting the clock to that moment.
 *
 * Without this the clock only ever restarts when someone finishes a break in
 * the app, so a walk at lunch left them being told they had been sitting all
 * afternoon — the opposite of what onboarding promises.
 *
 * The read happens on mount, whenever the app comes back to the foreground,
 * and on a slow poll in between. Core Motion answers from a stored history, so
 * a reading is just as good after the fact as it would have been live.
 */
export function useMotionReset(enabled: boolean): void {
  const { session, markMoved } = useSession();
  const sittingSince = session.sittingSince;

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    const check = async () => {
      const movedAt = await readLastMovement(sittingSince);
      if (!cancelled && movedAt !== null) markMoved(movedAt);
    };

    void check();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };

    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void check();
    }, POLL_MS);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [enabled, sittingSince, markMoved]);
}
