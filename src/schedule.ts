/**
 * Builds the day's plan: where breaks land, which ones meetings pushed, and
 * what state each row is in right now.
 *
 * Both the onboarding preview (A15) and Today's timeline (B1) read from here,
 * so the plan the user is shown during setup is the plan they get.
 */

import {
  type Exercise,
  exercisesForRegion,
  EXERCISES,
} from './exercises';
import {
  type BodyRegion,
  type OnboardingState,
  effectiveInterval,
} from './onboarding/state';
import {
  type Meeting,
  type SessionState,
  activeExclusions,
  breaksToday,
  skippedToday,
  snoozedToday,
} from './session/state';

export type SlotStatus = 'done' | 'active' | 'upcoming' | 'skipped';

export interface BreakSlot {
  kind: 'break';
  /**
   * The slot's identity: minutes from midnight after any meeting shuffle.
   * Stays put when the user snoozes, so done and skipped records still match.
   */
  at: number;
  /** Where the slot sits on the clock right now, snoozes included. */
  showsAt: number;
  /** True when a meeting pushed this break out of its original slot. */
  movedByMeeting: boolean;
  /** True when the user pushed it back themselves. */
  snoozed: boolean;
  exercise: Exercise;
  status: SlotStatus;
}

export interface MeetingSlot {
  kind: 'meeting';
  at: number;
  end: number;
  title: string;
}

export type DayRow = BreakSlot | MeetingSlot;

/** How long after a meeting ends we are willing to slot a displaced break. */
const POST_MEETING_GAP = 15;

/** Round up to the next quarter hour, the way a human says a time. */
function nextQuarterHour(minutes: number): number {
  return Math.ceil(minutes / 15) * 15;
}

function overlaps(minutes: number, meeting: Meeting): boolean {
  return minutes >= meeting.start && minutes < meeting.end;
}

/**
 * Chooses one exercise per slot, rotating through the user's focus areas so
 * the same body part never comes up twice in a row, and honouring the
 * privacy level and the seated-only adaptation.
 */
export function pickExercises(
  state: OnboardingState,
  count: number,
  session?: SessionState,
): Exercise[] {
  const wantsSubtle = state.visibility === 'open' || state.adaptations.seatedOnly;
  const excluded = session
    ? activeExclusions(session)
    : { exerciseIds: new Set<string>(), regions: new Set<BodyRegion>() };

  const chosen =
    state.bothers.length > 0
      ? state.bothers
      : (['shoulders', 'lowerBack', 'lowEnergy'] as BodyRegion[]);
  // A rested body area drops out of the rotation until its window expires,
  // unless it was the only thing the user asked for.
  const rested = chosen.filter((region) => !excluded.regions.has(region));
  const regions: BodyRegion[] = rested.length > 0 ? rested : chosen;

  const picked: Exercise[] = [];

  for (let index = 0; index < count; index += 1) {
    const region = regions[index % regions.length];
    const candidates = exercisesForRegion(region);
    const allowed = candidates.filter(
      (exercise) =>
        !excluded.exerciseIds.has(exercise.id) &&
        (!wantsSubtle || exercise.subtle),
    );
    const usable = allowed.length > 0 ? allowed : candidates;

    // Rotate within the region too, so the second neck break differs.
    const lap = Math.floor(index / regions.length);
    picked.push(usable[lap % usable.length]);
  }

  return picked;
}

/**
 * When today's plan begins.
 *
 * Normally that is the start of the user's sitting hours, but on the day they
 * set MoveMate up the plan starts when they finished onboarding — we can't
 * credit or blame them for breaks scheduled before the app existed.
 */
function planStart(state: OnboardingState, now: Date): number {
  if (!state.completedAt) return state.startMinutes;

  const completed = new Date(state.completedAt);
  const isToday = completed.toDateString() === now.toDateString();
  if (!isToday) return state.startMinutes;

  return Math.max(
    state.startMinutes,
    completed.getHours() * 60 + completed.getMinutes(),
  );
}

/** The raw times breaks would fire at, before meetings are considered. */
function slotTimes(state: OnboardingState, now: Date): number[] {
  const interval = effectiveInterval(state.interval);
  const first = nextQuarterHour(planStart(state, now));
  const times: number[] = [];

  for (
    let minutes = first;
    minutes <= state.endMinutes - 1;
    minutes += interval
  ) {
    times.push(minutes);
  }

  return times.length > 0 ? times : [first];
}

/**
 * Works out where each break actually lands once meetings are considered.
 *
 * A slot keeps its original time as its identity — that is what "done" and
 * "skipped" records point at — and carries the displaced time separately.
 * Two breaks pushed out by the same meeting are staggered rather than stacked
 * on the same minute.
 */
function applyMeetings(
  times: number[],
  meetings: Meeting[],
  endMinutes: number,
): { at: number; movedTo: number | null }[] {
  const placements = times.map((time) => {
    const clash = meetings.find((meeting) => overlaps(time, meeting));
    return {
      at: time,
      movedTo: clash
        ? Math.min(nextQuarterHour(clash.end + POST_MEETING_GAP), endMinutes)
        : null,
    };
  });

  // A displaced break can land on a minute that already has one. Walk the day
  // in order and nudge collisions apart, letting slots that never moved keep
  // their time so only the displaced break gives ground.
  const shownAt = (slot: (typeof placements)[number]): number =>
    slot.movedTo ?? slot.at;

  const order = [...placements].sort(
    (a, b) =>
      shownAt(a) - shownAt(b) ||
      Number(a.movedTo !== null) - Number(b.movedTo !== null),
  );

  let previous = -Infinity;
  for (const slot of order) {
    const shown = shownAt(slot);
    if (shown > previous) {
      previous = shown;
      continue;
    }
    slot.movedTo = Math.min(previous + POST_MEETING_GAP, endMinutes);
    previous = slot.movedTo;
  }

  return placements;
}

/**
 * The full day: break rows plus meeting rows, in time order, each break
 * tagged with where it stands right now.
 */
export function buildDay(
  answers: OnboardingState,
  session: SessionState,
  now: Date = new Date(),
): DayRow[] {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const times = slotTimes(answers, now);
  const placed = applyMeetings(times, session.meetings, answers.endMinutes);
  const exercises = pickExercises(answers, placed.length, session);

  // Snoozes move a slot's clock time but keep its identity, so "done" and
  // "skipped" still line up with the slot the user was offered.
  const snoozes = snoozedToday(session);

  const done = breaksToday(session);
  const doneSlots = new Set(
    done.map((entry) => entry.slot).filter((slot): slot is number => slot !== null),
  );
  const skipped = new Set(skippedToday(session));

  /** Where a slot sits on the clock, after a meeting move and any snooze. */
  const placedAt = new Map(placed.map((slot) => [slot.at, slot.movedTo ?? slot.at]));
  const showsAt = (slot: number): number =>
    snoozes[slot] ?? placedAt.get(slot) ?? slot;

  // "Up next" is the soonest slot still outstanding. A slot whose time has
  // already gone by is a missed one, not the next one — except when the whole
  // remaining plan is behind us, in which case the last one is still due.
  const outstanding = placed.filter(
    (slot) => !doneSlots.has(slot.at) && !skipped.has(slot.at),
  );
  const activeAt = (
    outstanding.find((slot) => showsAt(slot.at) >= nowMinutes) ??
    outstanding[outstanding.length - 1]
  )?.at;

  const breaks: BreakSlot[] = placed.map((slot, index) => {
    let status: SlotStatus;
    if (doneSlots.has(slot.at)) status = 'done';
    else if (skipped.has(slot.at)) status = 'skipped';
    else if (slot.at === activeAt) status = 'active';
    else if (showsAt(slot.at) < nowMinutes) status = 'skipped';
    else status = 'upcoming';

    return {
      kind: 'break',
      at: slot.at,
      showsAt: showsAt(slot.at),
      movedByMeeting: slot.movedTo !== null,
      snoozed: snoozes[slot.at] !== undefined,
      exercise: exercises[index],
      status,
    };
  });

  // Only meetings that overlap the part of the day the plan covers; a meeting
  // that finished before setup explains nothing about the breaks shown.
  const firstSlot = placed[0]?.at ?? answers.startMinutes;
  const meetingRows: MeetingSlot[] = session.meetings
    .filter((meeting) => meeting.end > firstSlot)
    .map((meeting) => ({
      kind: 'meeting',
      at: meeting.start,
      end: meeting.end,
      title: meeting.title,
    }));

  const sortKey = (row: DayRow): number =>
    row.kind === 'break' ? row.showsAt : row.at;

  return [...breaks, ...meetingRows].sort((a, b) => sortKey(a) - sortKey(b));
}

/**
 * The next few breaks, for onboarding's "Today, from here" preview. Once the
 * day's window has passed it rolls forward to the start of the next one.
 */
export function previewNextBreaks(
  answers: OnboardingState,
  session: SessionState,
  now: Date = new Date(),
  count = 3,
): BreakSlot[] {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const breaks = buildDay(answers, session, now).filter(
    (row): row is BreakSlot => row.kind === 'break',
  );

  const remaining = breaks.filter(
    (slot) => slot.status !== 'done' && slot.showsAt >= nowMinutes,
  );
  if (remaining.length >= count) return remaining.slice(0, count);

  return [...remaining, ...breaks].slice(0, count);
}

/** The next break due, or `null` once the day's plan is exhausted. */
export function nextBreak(rows: DayRow[]): BreakSlot | null {
  return (
    rows.find(
      (row): row is BreakSlot => row.kind === 'break' && row.status === 'active',
    ) ?? null
  );
}

/**
 * The three exercises a single break runs through, starting from `lead`.
 * Quick actions pass their own lead exercise; the scheduled break uses its own.
 */
export function buildSequence(
  answers: OnboardingState,
  lead: Exercise,
  session?: SessionState,
  length = 3,
): Exercise[] {
  const wantsSubtle =
    answers.visibility === 'open' || answers.adaptations.seatedOnly;
  const excluded = session
    ? activeExclusions(session)
    : { exerciseIds: new Set<string>(), regions: new Set<BodyRegion>() };

  const pool = EXERCISES.filter((exercise) => {
    if (exercise.id === lead.id) return false;
    if (wantsSubtle && !exercise.subtle) return false;
    if (excluded.exerciseIds.has(exercise.id)) return false;
    if (excluded.regions.has(exercise.region)) return false;
    return true;
  });

  // Prefer the user's focus areas, then anything else, and never repeat a
  // body area back to back.
  const preferred = pool.filter((exercise) =>
    answers.bothers.includes(exercise.region),
  );
  const ordered = [...preferred, ...pool.filter((e) => !preferred.includes(e))];

  const sequence: Exercise[] = [lead];
  for (const exercise of ordered) {
    if (sequence.length >= length) break;
    if (exercise.region === sequence[sequence.length - 1].region) continue;
    sequence.push(exercise);
  }

  return sequence;
}

/**
 * An alternative to `current` for the swap control.
 *
 * Prefers another exercise for the same body area, and falls back to the wider
 * catalogue when that area has nothing else to offer. `avoid` keeps a swap
 * from producing a duplicate of something already queued in the same break.
 */
export function swapExercise(
  current: Exercise,
  session?: SessionState,
  avoid: ReadonlySet<string> = new Set(),
): Exercise {
  const excluded = session
    ? activeExclusions(session)
    : { exerciseIds: new Set<string>(), regions: new Set<BodyRegion>() };

  const usable = (exercise: Exercise): boolean =>
    exercise.id !== current.id &&
    !avoid.has(exercise.id) &&
    !excluded.exerciseIds.has(exercise.id);

  const sameArea = exercisesForRegion(current.region).filter(usable);
  if (sameArea.length > 0) {
    // Rotate rather than always landing on the first alternative.
    const order = exercisesForRegion(current.region);
    const from = order.findIndex((exercise) => exercise.id === current.id);
    const rotated = [...order.slice(from + 1), ...order.slice(0, from)];
    return rotated.find(usable) ?? sameArea[0];
  }

  const elsewhere = EXERCISES.filter(
    (exercise) =>
      usable(exercise) &&
      !excluded.regions.has(exercise.region) &&
      (!current.subtle || exercise.subtle),
  );
  return elsewhere[0] ?? current;
}
