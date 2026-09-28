/**
 * Domain rules — tier 2.
 *
 * What Insights promises about the user's progress. Each test name is the
 * rule in one sentence.
 */

import { describe, expect, it } from 'vitest';
import { type BodyRegion, initialState } from '../onboarding/state';
import { type CompletedBreak, type SessionState, dateKey, emptySession } from '../session/state';
import { dayLevel, dayScore, milestones, monthDays, monthRange, weeksOnTarget } from './progress';

/** Monday to Friday, 9 to 5:30, six breaks a day: the default answer sheet. */
const schedule = {
  ...initialState,
  startMinutes: 9 * 60,
  endMinutes: 17 * 60 + 30,
  dailyGoal: 6,
  completedAt: new Date(2026, 8, 1).toISOString(),
};

/** A day in September 2026: the 1st is a Tuesday, the 28th a Monday. */
function sept(day: number): Date {
  return new Date(2026, 8, day, 12);
}

function aBreak(at: number, region: BodyRegion = 'neck'): CompletedBreak {
  return { exerciseId: 'neck-rolls', region, at, slot: at, seconds: 60 };
}

/** `count` breaks on each listed day, an hour apart from 9:30. */
function withBreaks(days: Record<number, number>): SessionState {
  const session = emptySession();
  for (const [day, count] of Object.entries(days)) {
    session.history[dateKey(sept(Number(day)))] = Array.from({ length: count }, (_, index) =>
      aBreak(9 * 60 + 30 + index * 60),
    );
  }
  return session;
}

describe('you vs. the chair', () => {
  it('gives an hour to the user when a break lands in it', () => {
    const score = dayScore(schedule, [aBreak(9 * 60 + 40)], 12 * 60);
    expect(score.hours[0].owner).toBe('you');
    expect(score.you).toBe(1);
  });

  it('gives a finished hour with no break in it to the chair', () => {
    const score = dayScore(schedule, [aBreak(9 * 60 + 40)], 12 * 60);
    expect(score.hours.slice(1, 3).map((hour) => hour.owner)).toEqual(['chair', 'chair']);
    expect(score.chair).toBe(2);
  });

  it('never gives the chair an hour that has not finished yet', () => {
    const score = dayScore(schedule, [], 11 * 60 + 20);
    expect(score.hours[2].owner).toBe('ahead');
    expect(score.chair).toBe(2);
  });

  it('credits a break taken outside the active hours to the nearest one', () => {
    const score = dayScore(schedule, [aBreak(8 * 60), aBreak(19 * 60)], null);
    expect(score.hours[0].owner).toBe('you');
    expect(score.hours[score.hours.length - 1].owner).toBe('you');
    expect(score.breaks).toEqual([9 * 60, 17 * 60 + 29]);
  });

  it('cuts the last hour short when the day ends on the half hour', () => {
    const score = dayScore(schedule, [], null);
    expect(score.hours).toHaveLength(9);
    expect(score.hours[8]).toMatchObject({ start: 17 * 60, end: 17 * 60 + 30 });
  });

  it('treats every hour of a day that is over as finished', () => {
    const score = dayScore(schedule, [aBreak(10 * 60)], null);
    expect(score.hours.some((hour) => hour.owner === 'ahead')).toBe(false);
    expect(score.you + score.chair).toBe(score.hours.length);
  });
});

describe('weeks on target', () => {
  it('counts a week whose breaks reach the daily goal on every scheduled day', () => {
    // 30 breaks across the week of the 21st: five scheduled days of six.
    const session = withBreaks({ 21: 8, 22: 6, 23: 6, 24: 5, 25: 5 });
    expect(weeksOnTarget(session, schedule, sept(28))).toBe(1);
  });

  it('lets a good day make up for a lighter one within the same week', () => {
    const session = withBreaks({ 21: 10, 22: 2, 23: 6, 24: 6, 25: 6 });
    expect(weeksOnTarget(session, schedule, sept(28))).toBe(1);
  });

  it('never lets the week in progress end the run', () => {
    const session = withBreaks({ 14: 6, 15: 6, 16: 6, 17: 6, 18: 6, 21: 6, 22: 6, 23: 6, 24: 6, 25: 6, 28: 1 });
    expect(weeksOnTarget(session, schedule, sept(28))).toBe(2);
  });

  it('ends the run at a finished week that fell short', () => {
    const session = withBreaks({ 14: 6, 15: 6, 16: 6, 17: 6, 18: 6, 21: 1 });
    expect(weeksOnTarget(session, schedule, sept(28))).toBe(0);
  });
});

describe('the month calendar', () => {
  const context = { today: sept(28), start: sept(1), dayOff: false };

  it('marks a day perfect when its breaks reach the daily goal', () => {
    expect(dayLevel(6, 6, sept(24), context)).toBe('perfect');
    expect(dayLevel(9, 6, sept(24), context)).toBe('perfect');
  });

  it('shades a day by how much of the goal it reached', () => {
    expect(dayLevel(3, 6, sept(24), context)).toBe('most');
    expect(dayLevel(2, 6, sept(24), context)).toBe('some');
  });

  it('calls a scheduled day with no breaks quiet, never missed', () => {
    expect(dayLevel(0, 6, sept(24), context)).toBe('quiet');
  });

  it('leaves a day off blank when nothing happened on it', () => {
    expect(dayLevel(0, 6, sept(26), { ...context, dayOff: true })).toBe('off');
  });

  it('still celebrates breaks taken on a day off', () => {
    expect(dayLevel(6, 6, sept(26), { ...context, dayOff: true })).toBe('perfect');
  });

  it('holds off judging today until it is over', () => {
    expect(dayLevel(0, 6, sept(28), context)).toBe('pending');
  });

  it('leaves the days before the user started blank', () => {
    expect(dayLevel(0, 6, new Date(2026, 7, 31), context)).toBe('off');
  });

  it('starts each month under its own weekday, in a Monday-first week', () => {
    const days = monthDays(emptySession(), schedule, 2026, 8, sept(28));
    // 1 September 2026 is a Tuesday: one blank for Monday.
    expect(days[0]).toBeNull();
    expect(days[1]?.date.getDate()).toBe(1);
    expect(days.filter(Boolean)).toHaveLength(30);
  });

  it('lets only days that have happened be opened', () => {
    const days = monthDays(emptySession(), schedule, 2026, 8, sept(28));
    const open = days.filter((day) => day?.selectable).map((day) => day?.date.getDate());
    expect(open[open.length - 1]).toBe(28);
  });

  it('pages back no further than the month the user started in', () => {
    const range = monthRange(emptySession(), schedule, new Date(2026, 10, 3));
    expect(range.first).toEqual(new Date(2026, 8, 1));
    expect(range.last).toEqual(new Date(2026, 10, 1));
  });
});

describe('milestones', () => {
  const find = (list: ReturnType<typeof milestones>, id: string) =>
    list.find((milestone) => milestone.id === id)!;

  it('dates each milestone to the day it was reached, not the day it is viewed', () => {
    const session = withBreaks({ 2: 1, 3: 6 });
    const list = milestones(session, schedule, sept(28));
    expect(find(list, 'first-break').earnedOn).toBe(dateKey(sept(2)));
    expect(find(list, 'perfect-day').earnedOn).toBe(dateKey(sept(3)));
  });

  it('keeps a streak milestone after the streak that earned it has ended', () => {
    const days: Record<number, number> = {};
    for (const day of [1, 2, 3, 4, 7, 8, 9]) days[day] = 1;
    const list = milestones(withBreaks(days), schedule, sept(28));
    expect(find(list, 'streak-7').earnedOn).toBe(dateKey(sept(9)));
  });

  it('counts every break ever taken towards 100 breaks', () => {
    const list = milestones(withBreaks({ 1: 5, 14: 5, 28: 3 }), schedule, sept(28));
    expect(find(list, 'breaks-100')).toMatchObject({ earnedOn: null, current: 13, target: 100 });
  });

  it('needs every coverage column moved inside one Monday-to-Sunday week for a whole body week', () => {
    const session = emptySession();
    // Neck, back and wrists on Friday; hips and eyes the following Monday.
    session.history[dateKey(sept(25))] = [aBreak(600, 'neck'), aBreak(660, 'lowerBack'), aBreak(720, 'wrists')];
    session.history[dateKey(sept(28))] = [aBreak(600, 'hips'), aBreak(660, 'eyes')];
    const list = milestones(session, schedule, sept(28));
    expect(find(list, 'whole-body')).toMatchObject({ earnedOn: null, current: 2 });

    session.history[dateKey(sept(28))].push(aBreak(720, 'neck'), aBreak(780, 'shoulders'), aBreak(840, 'wrists'));
    expect(find(milestones(session, schedule, sept(28)), 'whole-body').earnedOn).toBe(dateKey(sept(28)));
  });

  it('measures a perfect day against the current daily goal', () => {
    const list = milestones(withBreaks({ 3: 4 }), { ...schedule, dailyGoal: 5 }, sept(28));
    expect(find(list, 'perfect-day')).toMatchObject({ earnedOn: null, current: 4, target: 5 });
  });
});
