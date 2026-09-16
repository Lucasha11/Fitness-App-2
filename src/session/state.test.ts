/**
 * Domain rules — tier 2.
 *
 * Each test name is a sentence about what the app promises the user. If a
 * rule here changes, the sentence should change with it: these read as the
 * spec, not as coverage.
 */

import { describe, expect, it } from 'vitest';
import {
  type CompletedBreak,
  type SessionState,
  activeExclusions,
  currentStreak,
  dateKey,
  emptySession,
  withCompletedBreak,
  withExcludedExercise,
  withMovementAt,
  withRestedRegion,
  withSnoozedSlot,
} from './state';

/** A date key `days` ago, for building history by hand. */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dateKey(date);
}

function aBreak(overrides: Partial<CompletedBreak> = {}): CompletedBreak {
  return {
    exerciseId: 'neck-rolls',
    region: 'neck',
    at: 10 * 60,
    slot: 10 * 60,
    seconds: 60,
    ...overrides,
  };
}

/** A session whose history has one break on each of the given day offsets. */
function withHistoryOn(offsets: number[]): SessionState {
  const session = emptySession();
  for (const offset of offsets) {
    session.history[daysAgo(offset)] = [aBreak()];
  }
  return session;
}

describe('the sitting clock', () => {
  it('resets when the user completes a break', () => {
    const before = emptySession();
    before.sittingSince = Date.now() - 60 * 60 * 1000;

    const after = withCompletedBreak(before, aBreak());

    expect(after.sittingSince).toBeGreaterThan(before.sittingSince);
  });

  it('moves forward when Core Motion sees the user get up', () => {
    const session = emptySession();
    session.sittingSince = Date.now() - 60 * 60 * 1000;
    const gotUpAt = Date.now() - 5 * 60 * 1000;

    expect(withMovementAt(session, gotUpAt).sittingSince).toBe(gotUpAt);
  });

  it('never winds backwards on a stale or out-of-order reading', () => {
    // A late-arriving reading must not make the user look like they have been
    // sitting longer than they really have.
    const session = emptySession();
    const now = Date.now();
    session.sittingSince = now;

    expect(withMovementAt(session, now - 60 * 60 * 1000).sittingSince).toBe(now);
  });

  it('never claims the user got up in the future', () => {
    const session = emptySession();
    session.sittingSince = Date.now() - 60 * 60 * 1000;

    const after = withMovementAt(session, Date.now() + 60 * 60 * 1000);

    expect(after.sittingSince).toBeLessThanOrEqual(Date.now());
  });
});

describe('exclusions', () => {
  it('drops an exercise for good when the user says it felt awkward', () => {
    const session = withExcludedExercise(emptySession(), 'desk-squats');

    expect(activeExclusions(session).exerciseIds.has('desk-squats')).toBe(true);
  });

  it('rests a body area the user says they hurt', () => {
    const session = withRestedRegion(emptySession(), 'lowerBack', 7);

    expect(activeExclusions(session).regions.has('lowerBack')).toBe(true);
  });

  it('lets a rested body area come back once its window expires', () => {
    // The whole point of the expiry: a sore shoulder must not silently
    // disable a body area forever.
    const session = withRestedRegion(emptySession(), 'lowerBack', 7);
    const afterWindow = new Date();
    afterWindow.setDate(afterWindow.getDate() + 8);

    expect(activeExclusions(session, afterWindow).regions.has('lowerBack')).toBe(
      false,
    );
  });

  it('replaces an area’s rest window rather than stacking a second one', () => {
    let session = withRestedRegion(emptySession(), 'neck', 7);
    session = withRestedRegion(session, 'neck', 3);

    expect(session.exclusions.regions.filter((e) => e.region === 'neck')).toHaveLength(
      1,
    );
  });
});

describe('the streak', () => {
  it('counts consecutive days that have a break', () => {
    expect(currentStreak(withHistoryOn([0, 1, 2]))).toBe(3);
  });

  it('survives today being empty, because the day is still in progress', () => {
    // Opening the app at 9am must not show a broken streak.
    expect(currentStreak(withHistoryOn([1, 2]))).toBe(2);
  });

  it('breaks on a missed day that is not today', () => {
    expect(currentStreak(withHistoryOn([0, 2, 3]))).toBe(1);
  });

  it('is zero for a user who has never taken a break', () => {
    expect(currentStreak(emptySession())).toBe(0);
  });
});

describe('snoozing', () => {
  it('moves when a break shows without changing which slot it is', () => {
    // The slot's identity is what done and skipped records point at, so a
    // snooze must leave it alone.
    const session = withSnoozedSlot(emptySession(), 10 * 60, 10);

    expect(session.snoozed[dateKey()][10 * 60]).toBe(10 * 60 + 10);
  });
});
