import {
  EXERCISE_DURATION_SECONDS,
  EXERCISE_SETS,
  isExerciseDuration,
  type ExerciseDuration,
} from '../exercises';
import type { BodyRegion, OnboardingState } from '../onboarding/state';

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
  /**
   * Whether a break plays a backing track. Separate from `soundOn`, which
   * governs the start/halfway/end cues: someone can want the cues without the
   * music, or the music without being pinged three times an exercise.
   */
  musicOn: boolean;
  /**
   * How long each exercise in a break runs. The start screen's "reduce total
   * time" control writes here, so a shortened break stays shortened the next
   * time rather than springing back to a minute.
   */
  exerciseSeconds: ExerciseDuration;
  feedback: FeedbackEntry[];
  exclusions: Exclusions;
  /**
   * Curated sets the user has hearted, as `EXERCISE_SETS` ids. Stored as ids
   * rather than copies of the sets: a set's contents are the catalogue's to
   * change, and a favourite should follow it when it does.
   */
  favouriteSetIds: string[];
  /**
   * Today's meetings, which displace any break that collides with one. Empty
   * until EventKit is wired up: onboarding no longer offers a calendar, since
   * the screen it offered it on could only ever seed invented events.
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
    musicOn: false,
    exerciseSeconds: EXERCISE_DURATION_SECONDS,
    feedback: [],
    exclusions: { exerciseIds: [], regions: [] },
    favouriteSetIds: [],
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

/**
 * A stored exercise length, or `fallback` when it is missing or unrunnable.
 *
 * Exported for its test: `loadSession` reaches for `window`, and the suite
 * runs in plain Node, so the rule lives out here where it can be checked.
 */
export function storedDuration(
  stored: number | undefined,
  fallback: ExerciseDuration,
): ExerciseDuration {
  return stored !== undefined && isExerciseDuration(stored) ? stored : fallback;
}

/**
 * The stored favourites, less anything the catalogue no longer has.
 *
 * Exported for its test: `loadSession` reaches for `window`, and the suite
 * runs in plain Node, so the rule lives out here where it can be checked.
 */
export function storedFavourites(stored: string[] | undefined): string[] {
  if (!Array.isArray(stored)) return [];
  const known = new Set(EXERCISE_SETS.map((set) => set.id));
  return [...new Set(stored.filter((id) => known.has(id)))];
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
      // A length written by a build that offered different choices must not
      // put an unrunnable duration into the player.
      exerciseSeconds: storedDuration(parsed.exerciseSeconds, base.exerciseSeconds),
      // Favourites arrived after the first records were written, and a set
      // since dropped from the catalogue must not leave a hole on the shelf.
      favouriteSetIds: storedFavourites(parsed.favouriteSetIds),
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

/** `YYYY-MM-DD` back to local midnight on that day. */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Whether the user's schedule leaves this day free. `activeDays` is Monday
 * first, as A8 draws it; `Date#getDay` is Sunday first.
 */
export function isDayOff(date: Date, activeDays: boolean[]): boolean {
  return !activeDays[(date.getDay() + 6) % 7];
}

function breaksOn(session: SessionState, date: Date): number {
  return (session.history[dateKey(date)] ?? []).length;
}

/** The earliest day with a break on it, or null before the first break. */
export function firstBreakDay(session: SessionState): Date | null {
  const keys = Object.keys(session.history)
    .filter((key) => session.history[key].length > 0)
    .sort();
  return keys.length > 0 ? fromDateKey(keys[0]) : null;
}

/**
 * Consecutive days ending today with at least one break.
 *
 * A day off in the user's schedule is stepped over rather than counted as a
 * miss: nobody should lose a streak to a weekend they never asked to be
 * nudged on. A break taken on a day off still counts towards it.
 */
export function currentStreak(
  session: SessionState,
  activeDays: boolean[],
  now: Date = new Date(),
): number {
  const first = firstBreakDay(session);
  if (!first) return 0;

  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let streak = 0;

  // A day still in progress shouldn't break the streak, so today may be
  // empty without ending it.
  for (let day = 0; cursor >= first; day += 1) {
    if (breaksOn(session, cursor) > 0) {
      streak += 1;
    } else if (day > 0 && !isDayOff(cursor, activeDays)) {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** The longest streak ever held, by the same rules as `currentStreak`. */
export function bestStreak(
  session: SessionState,
  activeDays: boolean[],
  now: Date = new Date(),
): number {
  const first = firstBreakDay(session);
  if (!first) return 0;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let run = 0;
  let best = 0;
  for (const cursor = new Date(first); cursor <= today; cursor.setDate(cursor.getDate() + 1)) {
    if (breaksOn(session, cursor) > 0) {
      run += 1;
      best = Math.max(best, run);
    } else if (cursor < today && !isDayOff(cursor, activeDays)) {
      run = 0;
    }
  }
  return best;
}

/**
 * The five columns of the weekly body-coverage strip, and which body areas
 * feed each. Low energy is a mood, not a place, so it feeds none.
 */
export const COVERAGE_GROUPS = [
  { label: 'Neck', regions: ['neck'] },
  { label: 'Back', regions: ['upperBack', 'lowerBack', 'shoulders'] },
  { label: 'Wrists', regions: ['wrists'] },
  { label: 'Hips', regions: ['hips'] },
  { label: 'Eyes', regions: ['eyes'] },
] as const satisfies readonly { label: string; regions: readonly BodyRegion[] }[];

/** The coverage column a body area feeds, or -1 for one that feeds none. */
export function coverageGroupOf(region: BodyRegion): number {
  return COVERAGE_GROUPS.findIndex((group) =>
    (group.regions as readonly BodyRegion[]).includes(region),
  );
}

/**
 * The moment the current sitting stretch began.
 *
 * `sittingSince` alone is not enough. It survives in storage overnight, so on
 * its own it would greet someone at 9am with "you've been sitting for 900
 * minutes" — time they spent asleep, commuting and making coffee. The start of
 * the user's own sitting window is therefore a floor: the clock never counts
 * time from before their day began.
 */
export function sittingStart(
  session: SessionState,
  answers: OnboardingState,
  now = Date.now(),
): number {
  const windowStart = new Date(now);
  windowStart.setHours(0, answers.startMinutes, 0, 0);

  return Math.max(session.sittingSince, windowStart.getTime());
}

/** Whole minutes since the user last got up. */
export function sittingMinutes(
  session: SessionState,
  answers: OnboardingState,
  now = Date.now(),
): number {
  return Math.max(0, Math.floor((now - sittingStart(session, answers, now)) / 60000));
}

/** Breaks taken in the last seven days. */
export function breaksThisWeek(
  session: SessionState,
  now: Date = new Date(),
): CompletedBreak[] {
  const cursor = new Date(now);
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

/**
 * Record that the user got up at `at`, as Core Motion saw it.
 *
 * Only ever moves the clock forwards: a stale or out-of-order reading must
 * never make the user look like they have been sitting longer than they have.
 */
export function withMovementAt(session: SessionState, at: number): SessionState {
  if (at <= session.sittingSince) return session;
  return { ...session, sittingSince: Math.min(at, Date.now()) };
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
  now: Date = new Date(),
): SessionState {
  const key = dateKey(now);
  const today = session.snoozed[key] ?? {};
  // Snoozing an already-snoozed slot moves it on from where it now sits. A
  // break that is already due moves on from now instead: "remind me in 10"
  // promises a time, and a reminder set for a minute gone by never fires.
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const from = Math.max(today[slot] ?? slot, nowMinutes);
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

/**
 * Heart a curated set, or un-heart one already hearted.
 *
 * Favourites keep catalogue order rather than the order they were added, so
 * the shelf does not reshuffle under the user's thumb every time they add one.
 */
export function withToggledFavouriteSet(
  session: SessionState,
  setId: string,
): SessionState {
  const favourited = session.favouriteSetIds.includes(setId);
  const next = favourited
    ? session.favouriteSetIds.filter((id) => id !== setId)
    : [...session.favouriteSetIds, setId];

  return {
    ...session,
    favouriteSetIds: EXERCISE_SETS.filter((set) => next.includes(set.id)).map(
      (set) => set.id,
    ),
  };
}
