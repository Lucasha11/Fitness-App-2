/**
 * Domain rules — tier 2.
 *
 * The scheduler is where a bug is least visible: nothing crashes, the day
 * just quietly comes out wrong. These cover the rules the README promises
 * and the invariants the code comments call out.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type BreakSlot,
  buildDay,
  MAX_PENDING_REMINDERS,
  buildSequence,
  pickExercises,
  upcomingReminders,
} from './schedule';
import { EXERCISES, exerciseById, setsContaining } from './exercises';
import { type OnboardingState, initialState } from './onboarding/state';
import {
  type SessionState,
  emptySession,
  withCompletedBreak,
  withExcludedExercise,
  withRestedRegion,
  withSkippedSlot,
  withSnoozedSlot,
} from './session/state';

/** Onboarding answers for someone whose day runs 9:00 to 17:30. */
function answers(overrides: Partial<OnboardingState> = {}): OnboardingState {
  return {
    ...initialState,
    bothers: ['neck', 'shoulders', 'lowerBack'],
    startMinutes: 9 * 60,
    endMinutes: 17 * 60 + 30,
    interval: 60,
    ...overrides,
  };
}

/** 8am today, so the whole plan is still ahead of "now". */
function earlyMorning(): Date {
  const date = new Date();
  date.setHours(8, 0, 0, 0);
  return date;
}

function breaksOf(rows: ReturnType<typeof buildDay>): BreakSlot[] {
  return rows.filter((row): row is BreakSlot => row.kind === 'break');
}

describe('the day plan', () => {
  it('schedules breaks inside the user’s sitting window', () => {
    const rows = breaksOf(buildDay(answers(), emptySession(), earlyMorning()));

    expect(rows.length).toBeGreaterThan(0);
    for (const slot of rows) {
      expect(slot.at).toBeGreaterThanOrEqual(9 * 60);
      expect(slot.at).toBeLessThan(17 * 60 + 30);
    }
  });

  it('puts the rows in time order', () => {
    const rows = buildDay(answers(), emptySession(), earlyMorning());
    const times = rows.map((row) => (row.kind === 'break' ? row.showsAt : row.at));

    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it('marks exactly one break as the one due next', () => {
    const rows = breaksOf(buildDay(answers(), emptySession(), earlyMorning()));

    expect(rows.filter((slot) => slot.status === 'active')).toHaveLength(1);
  });
});

describe('meetings', () => {
  const meeting = { start: 11 * 60, end: 11 * 60 + 45, title: 'Design standup' };

  function withMeeting(): SessionState {
    return { ...emptySession(), meetings: [meeting] };
  }

  it('pushes a colliding break into the gap after the meeting', () => {
    const rows = breaksOf(buildDay(answers(), withMeeting(), earlyMorning()));
    const moved = rows.filter((slot) => slot.movedByMeeting);

    expect(moved.length).toBeGreaterThan(0);
    for (const slot of moved) {
      expect(slot.showsAt).toBeGreaterThanOrEqual(meeting.end);
    }
  });

  it('leaves a displaced break’s slot identity where it was', () => {
    // `at` is what done and skipped records point at. Only `showsAt` moves.
    const rows = breaksOf(buildDay(answers(), withMeeting(), earlyMorning()));
    const moved = rows.find((slot) => slot.movedByMeeting);

    expect(moved).toBeDefined();
    expect(moved?.at).toBeLessThan(meeting.end);
  });

  it('never stacks two breaks on the same minute', () => {
    const rows = breaksOf(buildDay(answers(), withMeeting(), earlyMorning()));
    const shown = rows.map((slot) => slot.showsAt);

    expect(new Set(shown).size).toBe(shown.length);
  });
});

describe('choosing exercises', () => {
  it('offers only subtle exercises to someone in an open office', () => {
    const picked = pickExercises(answers({ visibility: 'open' }), 8);

    for (const exercise of picked) {
      expect(exercise.subtle, exercise.id).toBe(true);
    }
  });

  it('offers only subtle exercises to someone who can only work seated', () => {
    const seated = answers({
      adaptations: { ...initialState.adaptations, seatedOnly: true },
    });

    for (const exercise of pickExercises(seated, 8)) {
      expect(exercise.subtle, exercise.id).toBe(true);
    }
  });

  it('never offers an exercise the user called awkward', () => {
    const excluded = EXERCISES.find((exercise) => exercise.region === 'neck');
    expect(excluded).toBeDefined();
    const session = withExcludedExercise(emptySession(), excluded!.id);

    const picked = pickExercises(answers({ bothers: ['neck'] }), 8, session);

    expect(picked.map((exercise) => exercise.id)).not.toContain(excluded!.id);
  });

  it('rests a whole body area the user says they hurt', () => {
    const session = withRestedRegion(emptySession(), 'neck', 7);
    const picked = pickExercises(
      answers({ bothers: ['neck', 'shoulders'] }),
      8,
      session,
    );

    expect(picked.map((exercise) => exercise.region)).not.toContain('neck');
  });

  it('falls back rather than returning nothing when every filter excludes', () => {
    // A user who asked for one area and then rested it must still get a plan.
    const session = withRestedRegion(emptySession(), 'neck', 7);
    const picked = pickExercises(answers({ bothers: ['neck'] }), 4, session);

    expect(picked).toHaveLength(4);
    for (const exercise of picked) expect(exercise).toBeDefined();
  });
});

describe('a single break', () => {
  const lead = () => exerciseById('neck-rolls');

  it('runs only the move you picked when the library asks for one', () => {
    // Tapping a card in the library is a choice of that move, not a request
    // for a break built around it.
    const sequence = buildSequence(answers(), lead(), emptySession(), 1);

    expect(sequence).toHaveLength(1);
    expect(sequence[0].id).toBe(lead().id);
  });

  it('keeps a curated set’s own order, even where it repeats a body area', () => {
    // "Neck relief" is four neck exercises on purpose. The back-to-back rule
    // governs the dynamic top-up below, not a hand-made set.
    const sequence = buildSequence(answers({ bothers: ['neck'] }), lead(), emptySession());
    const set = setsContaining('neck-rolls').find((candidate) =>
      candidate.exerciseIds.every((id) =>
        sequence.some((exercise) => exercise.id === id),
      ),
    );

    if (set) {
      const order = sequence.map((exercise) => exercise.id);
      expect(order).toEqual(set.exerciseIds);
    }
  });

  it('avoids back-to-back body areas when it has to compose from the catalogue', () => {
    // Knock out most of the lead's sets so the dynamic top-up path runs.
    let session = emptySession();
    for (const id of ['neck-release', 'chin-tucks', 'levator-stretch']) {
      session = withExcludedExercise(session, id);
    }

    const sequence = buildSequence(answers(), lead(), session);
    const topUp = sequence.slice(1);

    expect(topUp.length).toBeGreaterThan(0);
    for (let i = 1; i < sequence.length; i += 1) {
      expect(sequence[i].region, sequence.map((e) => e.id).join(' > ')).not.toBe(
        sequence[i - 1].region,
      );
    }
  });

  it('starts on the exercise it was asked to lead with', () => {
    expect(buildSequence(answers(), lead(), emptySession())[0].id).toBe(
      'neck-rolls',
    );
  });

  it('never repeats an exercise within one break', () => {
    const ids = buildSequence(answers(), lead(), emptySession()).map((e) => e.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('break reminders', () => {
  // Monday 28 September 2026, 8am. Session records key on the real clock's
  // date, so the clock itself is pinned rather than just the `now` argument.
  const monday = new Date(2026, 8, 28, 8, 0);

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(monday);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const weekdaysOnly = [true, true, true, true, true, false, false];

  it('never reminds on a day the user switched off', () => {
    const reminders = upcomingReminders(
      answers({ activeDays: weekdaysOnly }),
      emptySession(),
      monday,
    );

    const weekends = reminders.filter((reminder) =>
      [0, 6].includes(reminder.fireAt.getDay()),
    );
    expect(reminders.length).toBeGreaterThan(0);
    expect(weekends).toEqual([]);
  });

  it('never announces a break that has already been taken or skipped', () => {
    const [first, second] = upcomingReminders(answers(), emptySession(), monday);

    let session = withCompletedBreak(emptySession(), {
      exerciseId: first.exercise.id,
      region: first.exercise.region,
      at: first.at,
      slot: first.at,
      seconds: 60,
    });
    session = withSkippedSlot(session, second.at);

    const ids = upcomingReminders(answers(), session, monday).map((r) => r.id);
    expect(ids).not.toContain(first.id);
    expect(ids).not.toContain(second.id);
  });

  it('moves a snoozed break’s reminder to its new time instead of adding a second one', () => {
    const [first] = upcomingReminders(answers(), emptySession(), monday);
    const snoozed = withSnoozedSlot(emptySession(), first.at, 10);

    const matching = upcomingReminders(answers(), snoozed, monday).filter(
      (reminder) => reminder.id === first.id,
    );

    expect(matching).toHaveLength(1);
    expect(matching[0].at).toBe(first.at);
    expect(matching[0].fireAt.getTime() - first.fireAt.getTime()).toBe(10 * 60_000);
  });

  it('never schedules a reminder for a time that has already passed', () => {
    const midday = new Date(2026, 8, 28, 12, 20);
    vi.setSystemTime(midday);

    const reminders = upcomingReminders(answers(), emptySession(), midday);

    expect(reminders.length).toBeGreaterThan(0);
    for (const reminder of reminders) {
      expect(reminder.fireAt.getTime()).toBeGreaterThan(midday.getTime());
    }
  });

  it('stays within the 64 pending reminders iOS will keep', () => {
    const everyHalfHour = answers({
      interval: 30,
      startMinutes: 6 * 60,
      endMinutes: 22 * 60,
      activeDays: [true, true, true, true, true, true, true],
    });

    const reminders = upcomingReminders(everyHalfHour, emptySession(), monday);

    expect(reminders).toHaveLength(MAX_PENDING_REMINDERS);
    // The cap drops the far end of the week, never today.
    expect(reminders[0].day).toBe('2026-09-28');
  });

  it('gives every reminder its own id that fits in a 32-bit integer', () => {
    const reminders = upcomingReminders(answers(), emptySession(), monday);
    const ids = reminders.map((reminder) => reminder.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(Number.isInteger(id)).toBe(true);
      expect(id).toBeLessThanOrEqual(2 ** 31 - 1);
    }
  });

  it('reminds on the same break the timeline shows for today', () => {
    const [first] = upcomingReminders(answers(), emptySession(), monday);
    const today = breaksOf(buildDay(answers(), emptySession(), monday));
    const slot = today.find((row) => row.at === first.at);

    expect(slot?.exercise.id).toBe(first.exercise.id);
  });
});
