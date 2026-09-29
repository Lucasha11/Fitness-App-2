/**
 * Everything the Insights tab says about the user's progress, as selectors
 * over the session's date-keyed history. Nothing here is stored: the chair's
 * score, the calendar and the milestones are all re-derived from the same
 * records Today writes, so they can never disagree with it.
 *
 * The daily goal is read as it stands today. History does not record the goal
 * a past day was planned against, so a user who raises their goal sees older
 * days measured by the new one.
 */

import type { OnboardingState } from '../onboarding/state';
import {
  type CompletedBreak,
  type SessionState,
  COVERAGE_GROUPS,
  bestStreak,
  coverageGroupOf,
  dateKey,
  firstBreakDay,
  isDayOff,
} from '../session/state';

type Schedule = Pick<
  OnboardingState,
  'activeDays' | 'startMinutes' | 'endMinutes' | 'dailyGoal' | 'completedAt'
>;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** The Monday on or before `date`. */
export function weekStart(date: Date): Date {
  return addDays(startOfDay(date), -((date.getDay() + 6) % 7));
}

function breaksOn(session: SessionState, date: Date): CompletedBreak[] {
  return session.history[dateKey(date)] ?? [];
}

/* ------------------------------------------------------------------ */
/* You vs. the chair                                                   */
/* ------------------------------------------------------------------ */

/** Who an hour of the user's day went to. */
export type HourOwner = 'you' | 'chair' | 'ahead';

export interface HourBucket {
  /** Minutes from midnight. The last hour of the day may be short. */
  start: number;
  end: number;
  owner: HourOwner;
}

export interface DayScore {
  /** The user's active hours, as minutes from midnight. */
  start: number;
  end: number;
  /** When each break landed, pulled inside the active hours, in time order. */
  breaks: number[];
  hours: HourBucket[];
  you: number;
  chair: number;
}

/**
 * Splits the user's active hours into hours and says who won each one: the
 * user if a break landed in it, the chair if it finished without one.
 *
 * `now` is minutes into the day being scored, or null when that day is over.
 * An hour still running belongs to nobody yet: the chair can only win an hour
 * the user has actually sat through.
 */
export function dayScore(
  schedule: Pick<Schedule, 'startMinutes' | 'endMinutes'>,
  breaks: CompletedBreak[],
  now: number | null,
): DayScore {
  const { startMinutes: start, endMinutes: end } = schedule;

  // A break a little before the day starts, or after it ends, was still the
  // user getting up. It counts for the nearest hour of their day rather than
  // vanishing off the edge of the chart.
  const clamp = (at: number) => Math.min(Math.max(at, start), Math.max(start, end - 1));
  const times = breaks.map((entry) => clamp(entry.at)).sort((a, b) => a - b);

  const hours: HourBucket[] = [];
  for (let from = start; from < end; from += 60) {
    const to = Math.min(from + 60, end);
    const moved = times.some((at) => at >= from && at < to);
    const finished = now === null || to <= now;
    hours.push({
      start: from,
      end: to,
      owner: moved ? 'you' : finished ? 'chair' : 'ahead',
    });
  }

  return {
    start,
    end,
    breaks: times,
    hours,
    you: hours.filter((hour) => hour.owner === 'you').length,
    chair: hours.filter((hour) => hour.owner === 'chair').length,
  };
}

/* ------------------------------------------------------------------ */
/* Streaks                                                             */
/* ------------------------------------------------------------------ */

/**
 * A week is on target when its breaks add up to the daily goal on every day
 * the user scheduled. Counts back from the current week, which may still get
 * there and so never ends the run while it is in progress.
 */
export function weeksOnTarget(
  session: SessionState,
  schedule: Pick<Schedule, 'activeDays' | 'dailyGoal'>,
  now: Date = new Date(),
): number {
  const scheduled = schedule.activeDays.filter(Boolean).length;
  const first = firstBreakDay(session);
  if (scheduled === 0 || !first) return 0;

  const target = scheduled * schedule.dailyGoal;
  const earliest = weekStart(first);
  let weeks = 0;

  for (let monday = weekStart(now); monday >= earliest; monday = addDays(monday, -7)) {
    let total = 0;
    for (let day = 0; day < 7; day += 1) total += breaksOn(session, addDays(monday, day)).length;

    const current = monday.getTime() === weekStart(now).getTime();
    if (total >= target) weeks += 1;
    else if (!current) break;
  }
  return weeks;
}

/* ------------------------------------------------------------------ */
/* The month calendar                                                  */
/* ------------------------------------------------------------------ */

/**
 * How a calendar day is shaded. Nothing here reads as failure: a scheduled
 * day with no breaks is `quiet`, and a day off or a day before the user
 * started is simply blank.
 */
export type DayLevel =
  | 'perfect'
  | 'most'
  | 'some'
  | 'quiet'
  | 'off'
  | 'pending'
  | 'future';

export interface CalendarDay {
  key: string;
  date: Date;
  level: DayLevel;
  breaks: number;
  isToday: boolean;
  /** Whether there is anything to show for it: past days and today. */
  selectable: boolean;
}

/** The first day the app has anything to say about. */
export function firstDay(session: SessionState, schedule: Pick<Schedule, 'completedAt'>): Date | null {
  const setup = schedule.completedAt ? startOfDay(new Date(schedule.completedAt)) : null;
  const firstBreak = firstBreakDay(session);
  if (!setup) return firstBreak;
  if (!firstBreak) return setup;
  return setup < firstBreak ? setup : firstBreak;
}

export function dayLevel(
  breaks: number,
  goal: number,
  date: Date,
  context: { today: Date; start: Date | null; dayOff: boolean },
): DayLevel {
  const day = startOfDay(date).getTime();
  const today = startOfDay(context.today).getTime();

  if (day > today) return 'future';
  if (breaks >= Math.max(1, goal)) return 'perfect';
  if (breaks >= Math.ceil(goal / 2)) return 'most';
  if (breaks > 0) return 'some';
  // An empty today is not a verdict yet.
  if (day === today) return 'pending';
  if (context.dayOff || !context.start || day < context.start.getTime()) return 'off';
  return 'quiet';
}

/**
 * One month as the calendar draws it: `null` pads the first row so the 1st
 * lands under its weekday, in a Monday-first week.
 */
export function monthDays(
  session: SessionState,
  schedule: Schedule,
  year: number,
  month: number,
  now: Date = new Date(),
): (CalendarDay | null)[] {
  const start = firstDay(session, schedule);
  const today = startOfDay(now);
  const first = new Date(year, month, 1);
  const cells: (CalendarDay | null)[] = Array.from(
    { length: (first.getDay() + 6) % 7 },
    () => null,
  );

  for (let date = first; date.getMonth() === month; date = addDays(date, 1)) {
    const breaks = breaksOn(session, date).length;
    const level = dayLevel(breaks, schedule.dailyGoal, date, {
      today,
      start,
      dayOff: isDayOff(date, schedule.activeDays),
    });
    cells.push({
      key: dateKey(date),
      date,
      level,
      breaks,
      isToday: date.getTime() === today.getTime(),
      selectable: level !== 'future',
    });
  }
  return cells;
}

/** The months the calendar can page between: from the first day to now. */
export function monthRange(
  session: SessionState,
  schedule: Pick<Schedule, 'completedAt'>,
  now: Date = new Date(),
): { first: Date; last: Date } {
  const start = firstDay(session, schedule) ?? now;
  return {
    first: new Date(start.getFullYear(), start.getMonth(), 1),
    last: new Date(now.getFullYear(), now.getMonth(), 1),
  };
}

/* ------------------------------------------------------------------ */
/* Milestones                                                          */
/* ------------------------------------------------------------------ */

export type MilestoneId =
  | 'first-break'
  | 'perfect-day'
  | 'streak-7'
  | 'whole-body'
  | 'breaks-100'
  | 'streak-30';

export interface Milestone {
  id: MilestoneId;
  title: string;
  /** The day it was reached, as a date key, or null while still ahead. */
  earnedOn: string | null;
  /** How far along the user is, in `unit`s out of `target`. */
  current: number;
  target: number;
  unit: 'break' | 'day' | 'area';
}

const MILESTONES: Omit<Milestone, 'earnedOn' | 'current'>[] = [
  { id: 'first-break', title: 'First break', target: 1, unit: 'break' },
  { id: 'perfect-day', title: 'Perfect day', target: 0, unit: 'break' },
  { id: 'streak-7', title: '7-day streak', target: 7, unit: 'day' },
  { id: 'whole-body', title: 'Whole body week', target: COVERAGE_GROUPS.length, unit: 'area' },
  { id: 'breaks-100', title: '100 breaks', target: 100, unit: 'break' },
  { id: 'streak-30', title: '30-day streak', target: 30, unit: 'day' },
];

/**
 * Every milestone, dated to the day it was first reached.
 *
 * Walks the history forward once, so a milestone keeps the day it was earned
 * even after the streak that earned it is long gone.
 */
export function milestones(
  session: SessionState,
  schedule: Pick<Schedule, 'activeDays' | 'dailyGoal'>,
  now: Date = new Date(),
): Milestone[] {
  const goal = Math.max(1, schedule.dailyGoal);
  const earned = new Map<MilestoneId, string>();
  const earn = (id: MilestoneId, key: string) => {
    if (!earned.has(id)) earned.set(id, key);
  };

  const today = startOfDay(now);
  const first = firstBreakDay(session);
  let total = 0;
  let bestDay = 0;
  let run = 0;
  let covered = new Set<number>();

  for (let date = first ?? addDays(today, 1); date <= today; date = addDays(date, 1)) {
    const key = dateKey(date);
    const day = breaksOn(session, date);
    if (date.getDay() === 1) covered = new Set();

    if (day.length > 0) run += 1;
    else if (date < today && !isDayOff(date, schedule.activeDays)) run = 0;

    total += day.length;
    bestDay = Math.max(bestDay, day.length);
    for (const entry of day) {
      const group = coverageGroupOf(entry.region);
      if (group >= 0) covered.add(group);
    }

    if (total >= 1) earn('first-break', key);
    if (day.length >= goal) earn('perfect-day', key);
    if (run >= 7) earn('streak-7', key);
    if (run >= 30) earn('streak-30', key);
    if (total >= 100) earn('breaks-100', key);
    if (covered.size === COVERAGE_GROUPS.length) earn('whole-body', key);
  }

  const best = bestStreak(session, schedule.activeDays, now);
  // This week's coverage, not the loop's: the loop stops at the last break,
  // and a week with nothing in it yet has covered nothing.
  const thisWeek = new Set<number>();
  for (let day = 0; day < 7; day += 1) {
    for (const entry of breaksOn(session, addDays(weekStart(now), day))) {
      const group = coverageGroupOf(entry.region);
      if (group >= 0) thisWeek.add(group);
    }
  }

  const progress: Record<MilestoneId, number> = {
    'first-break': total,
    'perfect-day': bestDay,
    'streak-7': best,
    'whole-body': thisWeek.size,
    'breaks-100': total,
    'streak-30': best,
  };

  return MILESTONES.map((milestone) => {
    const target = milestone.id === 'perfect-day' ? goal : milestone.target;
    const earnedOn = earned.get(milestone.id) ?? null;
    return {
      ...milestone,
      target,
      earnedOn,
      current: earnedOn ? target : Math.min(progress[milestone.id], target),
    };
  });
}
