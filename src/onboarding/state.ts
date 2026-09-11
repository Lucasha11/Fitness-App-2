/**
 * The onboarding answer sheet.
 *
 * Every screen in Onboarding.dc.html writes into this object and nothing else,
 * so "what did the user tell us" is a single serialisable value that the rest
 * of the app (the scheduler, the exercise picker) can read later.
 */

import { COACHES, type Coach } from '../components/coach';

export type DayType = 'desk' | 'hybrid' | 'driver' | 'student' | 'shift' | 'home';

export type BodyRegion =
  | 'neck'
  | 'shoulders'
  | 'lowerBack'
  | 'upperBack'
  | 'wrists'
  | 'hips'
  | 'eyes'
  | 'lowEnergy';

export type Visibility = 'private' | 'some' | 'open';

export type Intensity = 'gentle' | 'moderate' | 'energetic';

export type Adaptation =
  | 'seatedOnly'
  | 'wheelchair'
  | 'wristLimited'
  | 'avoidFloor'
  | 'avoidOverhead';

/** Minutes between nudges, or `auto` to let MoveMate pick. */
export type Interval = 30 | 45 | 60 | 90 | 'auto';

export type AccountChoice = 'apple' | 'email' | 'local';

export interface OnboardingState {
  dayType: DayType | null;
  /** Which animal coaches the user, picked on A1. */
  coach: Coach;
  bothers: BodyRegion[];
  visibility: Visibility;
  intensity: Intensity;
  adaptations: Record<Adaptation, boolean>;
  /** Index 0 is Monday, index 6 is Sunday — the M T W T F S S row in A8. */
  activeDays: boolean[];
  /** Minutes from midnight. */
  startMinutes: number;
  endMinutes: number;
  interval: Interval;
  dailyGoal: number;
  notificationsEnabled: boolean;
  calendarConnected: boolean;
  useMotion: boolean;
  saveToHealth: boolean;
  account: AccountChoice | null;
  completedAt: string | null;
}

/** Every default here is the value the design shows in its "resting" state. */
export const initialState: OnboardingState = {
  dayType: null,
  coach: 'panda',
  bothers: [],
  visibility: 'some',
  intensity: 'moderate',
  adaptations: {
    seatedOnly: false,
    wheelchair: false,
    wristLimited: false,
    avoidFloor: false,
    avoidOverhead: false,
  },
  activeDays: [true, true, true, true, true, false, false],
  startMinutes: 9 * 60,
  endMinutes: 17 * 60 + 30,
  interval: 45,
  dailyGoal: 6,
  notificationsEnabled: false,
  calendarConnected: false,
  useMotion: true,
  saveToHealth: false,
  account: null,
  completedAt: null,
};

export const MAX_BOTHERS = 4;

export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  neck: 'Neck',
  shoulders: 'Shoulders',
  lowerBack: 'Lower back',
  upperBack: 'Upper back',
  wrists: 'Wrists',
  hips: 'Hips',
  eyes: 'Eyes',
  lowEnergy: 'Low energy',
};

/** Chip order as drawn in A5. */
export const BODY_REGION_ORDER: BodyRegion[] = [
  'neck',
  'shoulders',
  'lowerBack',
  'upperBack',
  'wrists',
  'hips',
  'eyes',
  'lowEnergy',
];

export const ADAPTATION_LABELS: Record<Adaptation, string> = {
  seatedOnly: 'Seated only',
  wheelchair: 'Wheelchair user',
  wristLimited: 'Wrist-limited',
  avoidFloor: 'Avoid floor work',
  avoidOverhead: 'Avoid overhead',
};

export const ADAPTATION_ORDER: Adaptation[] = [
  'seatedOnly',
  'wheelchair',
  'wristLimited',
  'avoidFloor',
  'avoidOverhead',
];

export const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/* ------------------------------------------------------------------ */
/* Derived values                                                      */
/* ------------------------------------------------------------------ */

/** `9 * 60` -> `9:00 AM`. */
export function formatTime(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(total / 60);
  const minute = total % 60;
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

/** The three columns of the A8 time wheels. */
export interface ClockParts {
  /** 12 for both noon and midnight, as the wheel reads it. */
  hour12: number;
  minute: number;
  meridiem: 'AM' | 'PM';
}

export function timeParts(minutes: number): ClockParts {
  const total = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(total / 60);
  return {
    hour12: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute: total % 60,
    meridiem: hour24 < 12 ? 'AM' : 'PM',
  };
}

export function minutesFromParts({
  hour12,
  minute,
  meridiem,
}: ClockParts): number {
  return ((hour12 % 12) + (meridiem === 'PM' ? 12 : 0)) * 60 + minute;
}

/** Splits `9:00 AM` so the meridiem can be set in a smaller type size. */
export function splitTime(minutes: number): { clock: string; suffix: string } {
  const [clock, suffix] = formatTime(minutes).split(' ');
  return { clock, suffix };
}

/** Minutes of sitting the reminders have to cover. */
export function activeSpanMinutes(state: OnboardingState): number {
  return Math.max(0, state.endMinutes - state.startMinutes);
}

/** `auto` tunes itself; today it lands in the middle of the manual options. */
export function effectiveInterval(interval: Interval): number {
  return interval === 'auto' ? 60 : interval;
}

/** How many nudges fit inside the active hours at the chosen interval. */
export function breaksPerDay(state: OnboardingState): number {
  const span = activeSpanMinutes(state);
  const interval = effectiveInterval(state.interval);
  return Math.max(1, Math.floor(span / interval));
}

/** Breaks average 45 seconds, so movement time follows from the count. */
export function movementMinutes(breaks: number): number {
  return Math.max(1, Math.round((breaks * 45) / 60));
}

/**
 * The live sentence under the day/time pickers in A8, e.g.
 * "We'll nudge you Monday to Friday, 9:00 AM to 5:30 PM."
 */
export function scheduleSentence(state: OnboardingState): string {
  const window = `${formatTime(state.startMinutes)} to ${formatTime(state.endMinutes)}`;
  const selected = state.activeDays.flatMap((on, index) => (on ? [index] : []));

  if (selected.length === 0) {
    return 'Pick at least one day and we’ll take it from there.';
  }
  if (selected.length === 7) {
    return `We’ll nudge you every day, ${window}.`;
  }

  const isWeekdays =
    selected.length === 5 && selected.every((index) => index <= 4);
  if (isWeekdays) {
    return `We’ll nudge you Monday to Friday, ${window}.`;
  }

  const isContiguous = selected.every(
    (index, position) => position === 0 || index === selected[position - 1] + 1,
  );
  if (isContiguous && selected.length > 2) {
    return `We’ll nudge you ${DAY_NAMES[selected[0]]} to ${
      DAY_NAMES[selected[selected.length - 1]]
    }, ${window}.`;
  }

  const names = selected.map((index) => DAY_NAMES[index]);
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  return `We’ll nudge you ${list}, ${window}.`;
}

/** Evenly spaced nudge positions as percentages, for the A9 preview rail. */
export function previewOffsets(count: number): number[] {
  if (count <= 1) return [50];
  const first = 2;
  const last = 90;
  const gap = (last - first) / (count - 1);
  return Array.from({ length: count }, (_, index) => first + index * gap);
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'movemate.onboarding.v1';

export function loadState(): OnboardingState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return {
      ...initialState,
      ...parsed,
      adaptations: { ...initialState.adaptations, ...parsed.adaptations },
      coach: COACHES.includes(parsed.coach as Coach)
        ? (parsed.coach as Coach)
        : initialState.coach,
      activeDays: Array.isArray(parsed.activeDays) && parsed.activeDays.length === 7
        ? parsed.activeDays
        : initialState.activeDays,
    };
  } catch {
    return initialState;
  }
}

export function saveState(state: OnboardingState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or a full quota: onboarding still works, it just
    // won't survive a reload. Not worth interrupting the flow over.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Same as above.
  }
}
