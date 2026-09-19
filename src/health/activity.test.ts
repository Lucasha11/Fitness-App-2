/**
 * Boundary shapes — tier 3.
 *
 * Data crossing in from HealthKit is the one input the app does not control.
 * These cover what happens when it is missing, denied, or duplicated across
 * devices — the cases that are awkward to reproduce on a real phone.
 */

import { describe, expect, it } from 'vitest';
import {
  type DailyActivity,
  average,
  observed,
  reconcile,
  total,
  trend,
} from './activity';

function day(steps: number | null, date = '2026-01-01'): DailyActivity {
  return {
    date,
    steps,
    distanceMeters: null,
    activeEnergyKcal: null,
    exerciseMinutes: null,
    standMinutes: null,
    flightsClimbed: null,
  };
}

describe('reconciling several sources', () => {
  it('reads a metric HealthKit returned nothing for as null, never zero', () => {
    // A denied read and a genuinely empty day look identical, and both must
    // render as a gap rather than a zero line.
    expect(reconcile(undefined)).toBeNull();
  });

  it('trusts the richest source rather than summing them', () => {
    // A phone in a pocket and a watch on a wrist both record the same walk.
    const reading = {
      total: 14000,
      sources: [
        { bundleId: 'com.apple.health.iphone', name: 'iPhone', value: 6000 },
        { bundleId: 'com.apple.health.watch', name: 'Watch', value: 8000 },
      ],
    };

    expect(reconcile(reading)).toBe(8000);
  });

  it('sums instead when asked to', () => {
    const reading = {
      total: 14000,
      sources: [
        { bundleId: 'a', name: 'iPhone', value: 6000 },
        { bundleId: 'b', name: 'Watch', value: 8000 },
      ],
    };

    expect(reconcile(reading, 'sum')).toBe(14000);
  });

  it('takes the total as given when only one device reported', () => {
    const reading = {
      total: 6000,
      sources: [{ bundleId: 'a', name: 'iPhone', value: 6000 }],
    };

    expect(reconcile(reading)).toBe(6000);
  });
});

describe('summarising a window', () => {
  it('counts only the days that actually have a reading', () => {
    expect(observed([day(6000), day(null), day(4000)], 'steps')).toHaveLength(2);
  });

  it('averages over observed days, so a gap does not drag the figure down', () => {
    // Averaging across the missing day would report 3333 for someone who
    // walked 5000 on both days they were tracked.
    expect(average([day(5000), day(null), day(5000)], 'steps')).toBe(5000);
  });

  it('reports no total at all when nothing was observed', () => {
    expect(total([day(null), day(null)], 'steps')).toBeNull();
  });

  it('has no trend to report from a single day', () => {
    expect(trend([day(5000)], 'steps', 1)).toBeNull();
  });
});
