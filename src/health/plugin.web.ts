import type { HealthKitPlugin, MetricName, RawDay } from './plugin';

/**
 * The browser has no HealthKit, so this reports unavailable rather than
 * inventing data.
 *
 * The one exception is `?mockHealth=1`, which generates a plausible week so
 * the trend UI can be worked on with `npm run dev`. It is deliberately opt-in
 * per page load and leaves no trace in storage.
 */
export class HealthKitWeb implements HealthKitPlugin {
  private get mocking(): boolean {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('mockHealth') === '1';
  }

  async isAvailable(): Promise<{ available: boolean }> {
    return { available: this.mocking };
  }

  async requestAuthorization(): Promise<{ requested: boolean }> {
    return { requested: this.mocking };
  }

  async queryDailyTotals(options: {
    metrics: MetricName[];
    startDate: string;
    endDate: string;
  }): Promise<{ days: RawDay[] }> {
    if (!this.mocking) return { days: [] };

    const days: RawDay[] = [];
    const cursor = new Date(options.startDate);
    const end = new Date(options.endDate);

    // A fixed wave rather than random noise, so a reload doesn't redraw the
    // chart differently and make a layout bug look like a data bug.
    let index = 0;
    while (cursor < end) {
      const swing = Math.sin(index) * 0.35 + 1;
      const metrics: RawDay['metrics'] = {};

      for (const metric of options.metrics) {
        const base = MOCK_BASELINE[metric];
        metrics[metric] = {
          total: Math.round(base * swing),
          sources: [
            { bundleId: 'com.apple.health.mock', name: 'iPhone', value: Math.round(base * swing) },
          ],
        };
      }

      days.push({ date: dateKey(cursor), metrics });
      cursor.setDate(cursor.getDate() + 1);
      index += 1;
    }

    return { days };
  }
}

const MOCK_BASELINE: Record<MetricName, number> = {
  steps: 6200,
  distance: 4500,
  activeEnergy: 420,
  exerciseMinutes: 28,
  standMinutes: 240,
  flightsClimbed: 7,
};

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}
