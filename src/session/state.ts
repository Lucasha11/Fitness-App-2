import type { BodyRegion } from '../onboarding/state';

export type { BodyRegion };

/**
 * Everything the app learns about the user *after* onboarding: which breaks
 * they have taken, which they skipped, how long they have been sitting, and
 * their sound preference.
 *
 * Keyed by local date so streaks and weekly coverage fall out of the same
 * record rather than needing their own counters.
 */

export interface CompletedBreak {
  exerciseId: string;
  region: BodyRegion;
  /** Minutes from midnight the break was taken at. */
  at: number;
  /** The scheduled slot it satisfied, when it came from the day's plan. */
  slot: number | null;
  /** Seconds actually moved — exercises that ran down, not ones skipped. */
  seconds: number;
}

/** The C7 quick-feedback options. */
export type FeedbackVerdict = 'easy' | 'hard' | 'great' | 'awkward' | 'hurt';

export interface FeedbackEntry {
  exerciseId: string;
  verdict: FeedbackVerdict;
  /** Set when the verdict is `hurt`: the area they pointed at. */
  region?: BodyRegion;
  at: string;
}

/**
 * What the user has told us not to show them again. Regions carry an expiry
 * so a sore shoulder doesn't silently disable a body area forever.
 */
export interface Exclusions {
  exerciseIds: string[];
  regions: { region: BodyRegion; until: string }[];
}

export interface Meeting {
  /** Minutes from midnight. */
  start: number;
  end: number;
  title: string;
}

export interface SessionState {
  /** `YYYY-MM-DD` -> the breaks completed that day. */
  history: Record<string, CompletedBreak[]>;
  /** `YYYY-MM-DD` -> scheduled slots the user skipped. */
  skipped: Record<string, number[]>;
  /**
   * `YYYY-MM-DD` -> original slot -> the time it was pushed to. Snoozing moves
   * a break rather than dropping it, so the plan still adds up.
   */
  snoozed: Record<string, Record<number, number>>;
  /** Epoch ms of the last time the user got up. */
  sittingSince: number;
  soundOn: boolean;
  feedback: FeedbackEntry[];
  exclusions: Exclusions;
  /**
   * Today's meetings. Connecting a calendar in onboarding is still a stub, so
   * these stand in for EventKit until the real integration lands.
   */
  meetings: Meeting[];
}

const STORAGE_KEY = 'movemate.session.v1';

export function dateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export function emptySession(): SessionState {
  return {
    history: {},
    skipped: {},
    snoozed: {},
    sittingSince: Date.now(),
    soundOn: true,
    feedback: [],
    exclusions: { exerciseIds: [], regions: [] },
    meetings: [],
  };
}

/**
 * Fills in fields added after a record was written, so a history saved by an
 * earlier build can't put `undefined` into arithmetic downstream.
 */
function normaliseHistory(
  history: SessionState['history'] | undefined,
): SessionState['history'] {
  if (!history) return {};

  return Object.fromEntries(
    Object.entries(history).map(([day, entries]) => [
      day,
      entries.map((entry) => ({ ...entry, seconds: entry.seconds ?? 0 })),
    ]),
  );
}

export function loadSession(): SessionState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession();
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    const base = emptySession();
    return {
      ...base,
      ...parsed,
      // Nested defaults, so a record written by an earlier version loads.
      exclusions: { ...base.exclusions, ...parsed.exclusions },
      history: normaliseHistory(parsed.history),
    };
  } catch {
    return emptySession();
  }
}

export function saveSession(session: SessionState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Private browsing: the app still works for this visit.
  }
}

/* ------------------------------------------------------------------ */
/* Derived values                                                      */
/* ------------------------------------------------------------------ */

export function breaksToday(session: SessionState): CompletedBreak[] {
  return session.history[dateKey()] ?? [];
}

export function skippedToday(session: SessionState): number[] {
  return session.skipped[dateKey()] ?? [];
}

/** Original slot -> the time it was snoozed to, for today. */
export function snoozedToday(session: SessionState): Record<number, number> {
  return session.snoozed[dateKey()] ?? {};
}

/** Seconds of movement logged today. */
export function movedSecondsToday(session: SessionState): number {
  return breaksToday(session).reduce((total, entry) => total + entry.seconds, 0);
}

/**
 * What the exercise picker must avoid right now: specific exercises the user
 * dismissed, plus any body area still inside its cooling-off window.
 */
export function activeExclusions(
  session: SessionState,
  now: Date = new Date(),
): { exerciseIds: Set<string>; regions: Set<BodyRegion> } {
  return {
    exerciseIds: new Set(session.exclusions.exerciseIds),
    regions: new Set(
      session.exclusions.regions
        .filter((entry) => new Date(entry.until) > now)
        .map((entry) => entry.region),
    ),
  };
}

/** Consecutive days ending today with at least one break. */
export function currentStreak(session: SessionState): number {
  const cursor = new Date();
  let streak = 0;

  // A day still in progress shouldn't break the streak, so start counting at
  // today and allow the first miss only if it is today.
  for (let day = 0; day < 400; day += 1) {
    const done = (session.history[dateKey(cursor)] ?? []).length > 0;
    if (done) {
      streak += 1;
    } else if (day > 0) {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Whole minutes since the user last got up. */
export function sittingMinutes(session: SessionState, now = Date.now()): number {
  return Math.max(0, Math.floor((now - session.sittingSince) / 60000));
}

/** Breaks taken in the last seven days. */
export function breaksThisWeek(session: SessionState): CompletedBreak[] {
  const cursor = new Date();
  const collected: CompletedBreak[] = [];
  for (let day = 0; day < 7; day += 1) {
    collected.push(...(session.history[dateKey(cursor)] ?? []));
    cursor.setDate(cursor.getDate() - 1);
  }
  return collected;
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

/** Record a finished break; finishing one means the sitting clock restarts. */
export function withCompletedBreak(
  session: SessionState,
  entry: CompletedBreak,
): SessionState {
  const key = dateKey();
  return {
    ...session,
    history: {
      ...session.history,
      [key]: [...(session.history[key] ?? []), entry],
    },
    sittingSince: Date.now(),
  };
}

export function withSkippedSlot(
  session: SessionState,
  slot: number,
): SessionState {
  const key = dateKey();
  const existing = session.skipped[key] ?? [];
  if (existing.includes(slot)) return session;
  return {
    ...session,
    skipped: { ...session.skipped, [key]: [...existing, slot] },
  };
}

export function withoutSkippedSlot(
  session: SessionState,
  slot: number,
): SessionState {
  const key = dateKey();
  return {
    ...session,
    skipped: {
      ...session.skipped,
      [key]: (session.skipped[key] ?? []).filter((item) => item !== slot),
    },
  };
}

/** Skip every slot in `slots` at once — C8's "skip today's remaining". */
export function withSkippedSlots(
  session: SessionState,
  slots: number[],
): SessionState {
  const key = dateKey();
  const existing = session.skipped[key] ?? [];
  const merged = [...new Set([...existing, ...slots])];
  return { ...session, skipped: { ...session.skipped, [key]: merged } };
}

/** Push a slot later instead of dropping it. */
export function withSnoozedSlot(
  session: SessionState,
  slot: number,
  minutes: number,
): SessionState {
  const key = dateKey();
  const today = session.snoozed[key] ?? {};
  // Snoozing an already-snoozed slot moves it on from where it now sits.
  const from = today[slot] ?? slot;
  return {
    ...session,
    snoozed: { ...session.snoozed, [key]: { ...today, [slot]: from + minutes } },
  };
}

export function withFeedback(
  session: SessionState,
  entry: FeedbackEntry,
): SessionState {
  return { ...session, feedback: [...session.feedback, entry] };
}

export function withExcludedExercise(
  session: SessionState,
  exerciseId: string,
): SessionState {
  if (session.exclusions.exerciseIds.includes(exerciseId)) return session;
  return {
    ...session,
    exclusions: {
      ...session.exclusions,
      exerciseIds: [...session.exclusions.exerciseIds, exerciseId],
    },
  };
}

/** Rest a sore body area for a while rather than banning it outright. */
export function withRestedRegion(
  session: SessionState,
  region: BodyRegion,
  days: number,
): SessionState {
  const until = new Date();
  until.setDate(until.getDate() + days);

  return {
    ...session,
    exclusions: {
      ...session.exclusions,
      regions: [
        ...session.exclusions.regions.filter((entry) => entry.region !== region),
        { region, until: until.toISOString() },
      ],
    },
  };
}
