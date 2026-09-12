import { useEffect, useState } from 'react';
import { type ActivityWindow, readActivityWindow } from './activity';
import type { MetricName } from './plugin';

const PENDING: ActivityWindow = { status: 'loading', days: [] };

/**
 * Loads a window of HealthKit movement data once per mount.
 *
 * There is no polling: HealthKit totals for past days don't move, and today's
 * figure being a few minutes stale is a better trade than waking the store on
 * a timer. A pull-to-refresh or a foreground listener is the natural place to
 * re-read when that stops being true.
 */
export function useActivity(
  dayCount: number,
  metrics: MetricName[],
): ActivityWindow {
  const [window, setWindow] = useState<ActivityWindow>(PENDING);

  // Metrics are passed inline at every call site, so depend on their names
  // rather than the array identity or this re-queries on every render.
  const key = metrics.join(',');

  useEffect(() => {
    let cancelled = false;

    readActivityWindow(dayCount, key.split(',') as MetricName[]).then((result) => {
      if (!cancelled) setWindow(result);
    });

    return () => {
      cancelled = true;
    };
  }, [dayCount, key]);

  return window;
}
