import { registerPlugin } from '@capacitor/core';

/**
 * The metrics the native plugin knows how to read. These names are the
 * contract between `HealthKitPlugin.swift` and this app — the HealthKit
 * identifiers behind them never cross the bridge.
 */
export const METRICS = [
  'steps',
  'distance',
  'activeEnergy',
  'exerciseMinutes',
  'standMinutes',
  'flightsClimbed',
] as const;

export type MetricName = (typeof METRICS)[number];

/** One app or device that contributed samples for a metric on a day. */
export interface MetricSource {
  bundleId: string;
  name: string;
  value: number;
}

export interface MetricReading {
  /**
   * The summed value across every source, or `null` when HealthKit returned
   * no samples at all. `null` is not zero: a denied read looks identical to a
   * genuinely empty day, and a trend line should show a gap for both.
   */
  total: number | null;
  sources: MetricSource[];
}

export interface RawDay {
  /** `YYYY-MM-DD` in the device's timezone, matching the session `dateKey`. */
  date: string;
  metrics: Partial<Record<MetricName, MetricReading>>;
}

export interface HealthKitPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  requestAuthorization(options: {
    metrics: MetricName[];
  }): Promise<{ requested: boolean }>;
  queryDailyTotals(options: {
    metrics: MetricName[];
    startDate: string;
    endDate: string;
  }): Promise<{ days: RawDay[] }>;
}

/**
 * On iOS this resolves to `HealthKitPlugin.swift`. Everywhere else it falls
 * back to the web shim below, which reports that there is nothing to read —
 * there is no browser API for HealthKit, and pretending otherwise would put
 * invented numbers in front of users.
 */
export const HealthKit = registerPlugin<HealthKitPlugin>('HealthKit', {
  web: async () => {
    const { HealthKitWeb } = await import('./plugin.web');
    return new HealthKitWeb();
  },
});
