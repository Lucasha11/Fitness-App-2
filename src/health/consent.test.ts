/**
 * Domain rules - tier 2.
 *
 * "Use motion & step data" is a promise made in setup and again in Settings.
 * Neither HealthKit nor Core Motion lets an app hand its access back, so the
 * only way to keep the promise is to stop asking. These pin that down at the
 * one door each read goes through.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const bridge = vi.hoisted(() => ({ calls: [] as string[] }));

// Every native plugin becomes a recorder that answers as if access were
// granted, so a read that slips past the preference is visible here.
vi.mock('@capacitor/core', () => ({
  registerPlugin: (name: string) =>
    new Proxy(
      {},
      {
        get: (_target, method) => async () => {
          bridge.calls.push(`${name}.${String(method)}`);
          return {
            available: true,
            authorized: true,
            days: [],
            movedAt: new Date().toISOString(),
          };
        },
      },
    ),
}));

const { readActivityWindow } = await import('./activity');
const { readLastMovement } = await import('./motion');

beforeEach(() => {
  bridge.calls.length = 0;
});

describe('movement data consent', () => {
  it('asks HealthKit for nothing once movement data is turned off', async () => {
    const window = await readActivityWindow(false, 14, ['steps']);

    expect(window.status).toBe('off');
    expect(bridge.calls).toEqual([]);
  });

  it('reads nothing from Core Motion once movement data is turned off', async () => {
    const movedAt = await readLastMovement(false, Date.now() - 60_000);

    expect(movedAt).toBeNull();
    expect(bridge.calls).toEqual([]);
  });

  it('reads Apple Health and Core Motion again once movement data is back on', async () => {
    await readActivityWindow(true, 14, ['steps']);
    await readLastMovement(true, Date.now() - 60_000);

    expect(bridge.calls).toContain('HealthKit.queryDailyTotals');
    expect(bridge.calls).toContain('Motion.lastMovedAt');
  });
});
