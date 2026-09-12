import {
  HealthKit,
  type MetricName,
  type MetricReading,
  type RawDay,
} from './plugin';

/** One local day of movement, reconciled down to a single number per metric. */
export interface DailyActivity {
  /** `YYYY-MM-DD`, matching the session store's `dateKey`. */
  date: string;
  /** `null` means "no data", which is never the same as `0`. */
  steps: number | null;
  distanceMeters: number | null;
  activeEnergyKcal: number | null;
  exerciseMinutes: number | null;
  standMinutes: number | null;
  flightsClimbed: number | null;
}

export type ActivityStatus =
  | 'unavailable'
  | 'loading'
  | 'ready'
  /** The query ran but every day came back empty — most often a denied read. */
  | 'empty'
  | 'error';

/**
 * How to collapse several sources into one number.
 *
 * An iPhone in a pocket and a Watch on a wrist both record steps for the same
 * walk, so summing them roughly doubles the day. Health's own screens run an
 * interleaving de-duplication that isn't exposed to third-party apps, so the
 * honest approximation is to trust the single richest source rather than add
 * them together.
 */
export type Reconciliation = 'dominant' | 'sum';

const DEFAULT_RECONCILIATION: Reconciliation = 'dominant';

/**
 * Cumulative metrics that more than one device records independently. These
 * are the ones a naive sum inflates.
 */
export function reconcile(
  reading: MetricReading | undefined,
  strategy: Reconciliation = DEFAULT_RECONCILIATION,
): number | null {
  if (!reading) return null;
  if (reading.sources.length <= 1) return reading.total;
  if (strategy === 'sum') return reading.total;

  return reading.sources.reduce(
    (best, source) => (source.value > best ? source.value : best),
    0,
  );
}

function toDaily(raw: RawDay, strategy: Reconciliation): DailyActivity {
  return {
    date: raw.date,
    steps: reconcile(raw.metrics.steps, strategy),
    distanceMeters: reconcile(raw.metrics.distance, strategy),
    activeEnergyKcal: reconcile(raw.metrics.activeEnergy, strategy),
    exerciseMinutes: reconcile(raw.metrics.exerciseMinutes, strategy),
    standMinutes: reconcile(raw.metrics.standMinutes, strategy),
    flightsClimbed: reconcile(raw.metrics.flightsClimbed, strategy),
  };
}

/** Local midnight `days` ago, so a window means whole days in the user's own timezone. */
function startOfDayAgo(days: number, from: Date): Date {
  const start = new Date(from);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return start;
}

export interface ActivityWindow {
  status: ActivityStatus;
  days: DailyActivity[];
  /** Set when `status` is `error`, for the UI to show instead of a chart. */
  message?: string;
}

/**
 * Reads the last `dayCount` days of movement, ending with today.
 *
 * Authorization is requested on every call: HealthKit shows its sheet once and
 * returns silently afterwards, so there is nothing to cache and no way to ask
 * whether a read was granted.
 */
export async function readActivityWindow(
  dayCount: number,
  metrics: MetricName[],
  now: Date = new Date(),
  strategy: Reconciliation = DEFAULT_RECONCILIATION,
): Promise<ActivityWindow> {
  try {
    const { available } = await HealthKit.isAvailable();
    if (!available) return { status: 'unavailable', days: [] };

    await HealthKit.requestAuthorization({ metrics });

    const start = startOfDayAgo(dayCount - 1, now);
    const { days } = await HealthKit.queryDailyTotals({
      metrics,
      startDate: start.toISOString(),
      endDate: now.toISOString(),
    });

    const reconciled = days.map((day) => toDaily(day, strategy));
    const hasAnyValue = reconciled.some((day) =>
      Object.entries(day).some(([key, value]) => key !== 'date' && value !== null),
    );

    return {
      status: hasAnyValue ? 'ready' : 'empty',
      days: reconciled,
    };
  } catch (error) {
    return {
      status: 'error',
      days: [],
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/* ------------------------------------------------------------------ */
/* Trend arithmetic                                                    */
/* ------------------------------------------------------------------ */

type NumericKey = Exclude<keyof DailyActivity, 'date'>;

/** Days that actually carry a value for `key`, so gaps never count as zeroes. */
export function observed(days: DailyActivity[], key: NumericKey): number[] {
  return days
    .map((day) => day[key])
    .filter((value): value is number => value !== null);
}

export function total(days: DailyActivity[], key: NumericKey): number | null {
  const values = observed(days, key);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

export function average(days: DailyActivity[], key: NumericKey): number | null {
  const values = observed(days, key);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * How the most recent `window` days compare with the `window` before them, as
 * a fraction. `null` when either side has no readings to compare.
 */
export function trend(
  days: DailyActivity[],
  key: NumericKey,
  window: number,
): number | null {
  if (days.length < window * 2) return null;

  const recent = average(days.slice(-window), key);
  const previous = average(days.slice(-window * 2, -window), key);
  if (recent === null || previous === null || previous === 0) return null;

  return (recent - previous) / previous;
}
