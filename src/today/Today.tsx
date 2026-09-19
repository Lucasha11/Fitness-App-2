import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChartIcon,
  CheckIcon,
  DashIcon,
  FlameIcon,
  GridIcon,
  HeartIcon,
  PersonIcon,
  PlayIcon,
  PlusIcon,
  ReplyIcon,
  TargetIcon,
} from '../components/icons';
import { COACH_LABEL, useCoach, useCoachNoun } from '../components/coach';
import { ActivityTrend } from './ActivityTrend';
import { useMotionReset } from '../health/useMotionReset';
import { Mascot } from '../components/Mascot';
import {
  EXERCISES_PER_BREAK,
  EXERCISE_SETS,
  type Exercise,
  type ExerciseSet,
  formatDuration,
  setExercises,
} from '../exercises';
import {
  BODY_REGION_LABELS,
  type OnboardingState,
  formatTime,
} from '../onboarding/state';
import { poseForSet, tintFor } from '../player/poses';
import { type BreakSlot, buildDay, nextBreak, pickExercises } from '../schedule';
import { useSession } from '../session/context';
import {
  breaksThisWeek,
  breaksToday,
  currentStreak,
  sittingMinutes,
} from '../session/state';
import { sittingHeadline } from './sitting';
import { countdownEyebrow } from './countdown';
import { buildShelves, type PackShelf } from './shelves';
import './today.css';

/** How far the next-break card's Snooze pushes a break. */
const SNOOZE_MINUTES = 10;

/** How often the countdown and sitting clock re-render. */
const TICK_MS = 20_000;

interface TodayProps {
  answers: OnboardingState;
  /** Opens the break player on the given exercise. */
  onStartBreak: (exercise: Exercise, slot: number | null) => void;
}

export function Today({ answers, onStartBreak }: TodayProps) {
  const { session, skipSlot, unskipSlot, snoozeSlot } = useSession();

  // A minute-resolution clock so "next break in 24 min" stays honest without
  // re-rendering the whole screen every second.
  useMotionReset(answers.useMotion);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const rows = useMemo(
    () => buildDay(answers, session, now),
    [answers, session, now],
  );
  const upNext = nextBreak(rows);
  const shelves = useMemo(
    () => buildShelves(answers, session, now),
    [answers, session, now],
  );

  const done = breaksToday(session).length;
  const goal = answers.dailyGoal;
  const streak = currentStreak(session);
  const sitting = sittingMinutes(session, answers, now.getTime());
  /**
   * How long a break takes at the length the user last chose on the start
   * screen. Advertising a flat minute here while every break actually runs
   * for twenty seconds is the kind of small lie that stops people trusting
   * the plan.
   */
  const breakSeconds = EXERCISES_PER_BREAK * session.exerciseSeconds;

  /** The Favourites shelf's empty state sends people here. */
  const browse = useRef<HTMLElement | null>(null);

  const startPack = (set: ExerciseSet) =>
    onStartBreak(setExercises(set)[0], null);

  const startNext = () => {
    const exercise = upNext?.exercise ?? pickExercises(answers, 1, session)[0];
    onStartBreak(exercise, upNext?.at ?? null);
  };

  return (
    <div className="today">
      <div className="today__scroll">
        <Header
          now={now}
          streak={streak}
          done={done}
          goal={goal}
          sitting={sitting}
        />

        <div className="today__body">
          <NextCapsule
            slot={upNext}
            now={now}
            breakSeconds={breakSeconds}
            onStart={startNext}
            onSnooze={() => upNext && snoozeSlot(upNext.at, SNOOZE_MINUTES)}
          />

          {shelves.map((shelf) => (
            <Shelf
              key={shelf.id}
              shelf={shelf}
              onStart={startPack}
              onBrowse={() => browse.current?.scrollIntoView({ behavior: 'smooth' })}
            />
          ))}

          <AllPacks ref={browse} onStart={startPack} />

          <section>
            <div className="today__section-head">
              <h2 className="today__h2">Today&rsquo;s plan</h2>
              <span className="today__hint">Swipe a row to skip</span>
            </div>
            <Timeline
              rows={rows}
              breakSeconds={breakSeconds}
              onStart={(slot) => onStartBreak(slot.exercise, slot.at)}
              onSkip={(slot) => skipSlot(slot.at)}
              onUnskip={(slot) => unskipSlot(slot.at)}
            />
          </section>

          <Coverage />

          <ActivityTrend />
        </div>
      </div>

      {/* The one primary action, over the shelves and clear of the tab bar. */}
      <div className="today__cta">
        <button type="button" className="start-pill" onClick={startNext}>
          <PlayIcon size={18} />
          Start workout
        </button>
      </div>

      <TabBar />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function greeting(hour: number): string {
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

/** `3` -> `three`, so the coach's line reads as speech rather than a score. */
const COUNT_WORDS = [
  'none',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];

function countWord(count: number): string {
  return COUNT_WORDS[count] ?? String(count);
}

/**
 * The coach's line at the top of the screen. It never scolds: a day with
 * nothing done yet is an invitation, not a telling-off.
 */
function coachLine(done: number, goal: number, sitting: number): string {
  // The day's first break is still owed, so the clock *is* the headline —
  // there is no separate sitting row under the card any more.
  if (done === 0) return sittingHeadline(sitting);
  if (done >= goal) return 'Goal met. The rest is a bonus.';

  // Sentence-initial, and short: the line sits in a 240px column beside a
  // 88px coach, so anything longer than this wraps to a third line.
  const word = countWord(done);
  return `${word[0].toUpperCase()}${word.slice(1)} down. Make it ${countWord(
    done + 1,
  )}?`;
}

function Header({
  now,
  streak,
  done,
  goal,
  sitting,
}: {
  now: Date;
  streak: number;
  done: number;
  goal: number;
  /** Minutes on the sitting clock. */
  sitting: number;
}) {
  const coach = useCoach();
  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long' });

  return (
    <header className="today__header">
      <div className="today__hero">
        <Mascot
          name="thumbsup"
          size={88}
          alt={`${COACH_LABEL[coach]} coach`}
          className="bob"
        />
        <div className="today__hero-text">
          {/* The streak shares the date's line rather than the headline's, so
              the coach's line gets the full column to wrap in. */}
          <div className="today__date-row">
            <span className="today__date">
              {dateLabel} &middot; {greeting(now.getHours())}
            </span>
            <button
              type="button"
              className="streak"
              aria-label={`Current streak: ${streak} ${streak === 1 ? 'day' : 'days'}`}
            >
              <FlameIcon size={13} />
              {streak}
            </button>
          </div>
          <h1 className="today__greeting">{coachLine(done, goal, sitting)}</h1>
        </div>
      </div>

      <GoalBar done={done} goal={goal} />
    </header>
  );
}

/**
 * The day's goal as one segment per break, rather than as a ring.
 *
 * A segment is a break, so the row doubles as the day's break tracker: how
 * many are done, and how many are still owed, without any arithmetic.
 */
function GoalBar({ done, goal }: { done: number; goal: number }) {
  const filled = Math.min(done, goal);

  return (
    <div className="goal-bar">
      <div className="goal-bar__head">
        <span className="goal-bar__label">Today&rsquo;s goal</span>
        <span className="goal-bar__count">
          {filled} of {goal}
        </span>
      </div>
      <div
        className="goal-bar__track"
        role="progressbar"
        aria-label="Breaks taken today"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={filled}
      >
        {Array.from({ length: goal }, (_, index) => (
          <span
            key={index}
            className="goal-bar__segment"
            data-done={index < filled}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Next break                                                          */
/* ------------------------------------------------------------------ */

/**
 * The next break, as one capsule: what is coming and how long it takes on
 * the left, the two things you can do about it on the right.
 *
 * The countdown is the eyebrow rather than a dial — one line of text says
 * the same thing as a ring and leaves the row to the buttons.
 *
 * `slot` is null once every scheduled break is done or skipped (brief §B3) —
 * the capsule then says so, and Start offers an extra break.
 */
function NextCapsule({
  slot,
  now,
  breakSeconds,
  onStart,
  onSnooze,
}: {
  slot: BreakSlot | null;
  now: Date;
  breakSeconds: number;
  onStart: () => void;
  onSnooze: () => void;
}) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const minutesAway = slot ? slot.showsAt - nowMinutes : 0;
  const length = formatDuration(breakSeconds);

  const eyebrow = slot ? countdownEyebrow(minutesAway) : 'ALL DONE TODAY';

  const title = slot ? slot.exercise.name : 'Anything extra';

  return (
    <article className="next-capsule">
      {/* Three lines, one thought each: when, what, how long. Running the
          name and the length together wraps mid-phrase on the longer names. */}
      <div className="next-capsule__text">
        <span className="next-capsule__eyebrow">{eyebrow}</span>
        <span className="next-capsule__title">{title}</span>
        <span className="next-capsule__length">{length}</span>
      </div>

      <div className="next-capsule__actions">
        {slot ? (
          <button
            type="button"
            className="next-capsule__snooze"
            onClick={onSnooze}
            aria-label={`Snooze ${SNOOZE_MINUTES} minutes`}
          >
            Snooze
          </button>
        ) : null}

        <button
          type="button"
          className="next-capsule__start"
          onClick={onStart}
          aria-label={
            slot
              ? `Start ${slot.exercise.name}, ${length}`
              : `Start an extra break, ${length}`
          }
        >
          Start
        </button>
      </div>

      {slot?.movedByMeeting ? (
        <p className="next-capsule__note">
          <ReplyIcon size={14} />
          Moved from {formatTime(slot.at)} to clear your meeting.
        </p>
      ) : null}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Pack shelves                                                        */
/* ------------------------------------------------------------------ */

/** A pack's tile art: its most distinctive drawn pose, tinted by body area. */
function packArt(set: ExerciseSet) {
  return { pose: poseForSet(set), tint: tintFor(setExercises(set)[0].region) };
}

function PackTile({
  set,
  onStart,
}: {
  set: ExerciseSet;
  onStart: (set: ExerciseSet) => void;
}) {
  const { session, toggleFavouriteSet } = useSession();
  const { pose, tint } = packArt(set);
  const favourited = session.favouriteSetIds.includes(set.id);

  return (
    <li className="pack">
      <button
        type="button"
        className="pack__art"
        style={{ background: tint }}
        onClick={() => onStart(set)}
      >
        <Mascot name={pose} size={88} />
      </button>
      <button
        type="button"
        className="pack__heart"
        aria-pressed={favourited}
        aria-label={
          favourited ? `Remove ${set.name} from favourites` : `Add ${set.name} to favourites`
        }
        onClick={() => toggleFavouriteSet(set.id)}
      >
        <HeartIcon size={14} />
      </button>
      <span className="pack__name">{set.name}</span>
    </li>
  );
}

function Shelf({
  shelf,
  onStart,
  onBrowse,
}: {
  shelf: PackShelf;
  onStart: (set: ExerciseSet) => void;
  onBrowse: () => void;
}) {
  return (
    <section className="shelf">
      <div className="today__section-head">
        <h2 className="today__h2">{shelf.title}</h2>
      </div>
      <ul className="shelf__row">
        {shelf.sets.map((set) => (
          <PackTile key={set.id} set={set} onStart={onStart} />
        ))}

        {/* Favourites is the one shelf that shows empty, so it carries the
            invitation to fill it. */}
        {shelf.id === 'favourites' ? (
          <li className="pack">
            <button type="button" className="pack__add" onClick={onBrowse}>
              <PlusIcon size={26} />
            </button>
            <span className="pack__name pack__name--muted">
              {shelf.sets.length === 0 ? 'Heart a pack' : 'Add'}
            </span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function AllPacks({
  ref,
  onStart,
}: {
  ref: React.Ref<HTMLElement>;
  onStart: (set: ExerciseSet) => void;
}) {
  return (
    <section className="shelf" ref={ref}>
      <div className="today__section-head">
        <h2 className="today__h2">All packs</h2>
        <span className="today__hint">{EXERCISE_SETS.length} to choose from</span>
      </div>
      <ul className="shelf__grid">
        {EXERCISE_SETS.map((set) => (
          <PackTile key={set.id} set={set} onStart={onStart} />
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

/** `2:15 PM` -> `2:15`; the rail is only 46px wide. */
function railTime(minutes: number): string {
  return formatTime(minutes).replace(/\s(AM|PM)$/, '');
}

function Timeline({
  rows,
  breakSeconds,
  onStart,
  onSkip,
  onUnskip,
}: {
  rows: ReturnType<typeof buildDay>;
  breakSeconds: number;
  onStart: (slot: BreakSlot) => void;
  onSkip: (slot: BreakSlot) => void;
  onUnskip: (slot: BreakSlot) => void;
}) {
  return (
    <ul className="timeline">
      {rows.map((row) => {
        if (row.kind === 'meeting') {
          return (
            <li key={`m-${row.at}`} className="tl-meeting">
              <span className="tl-meeting__time">{railTime(row.at)}</span>
              <span className="tl-meeting__title">
                {row.title} · {row.end - row.at} min
              </span>
            </li>
          );
        }

        return (
          <TimelineRow
            key={`b-${row.at}`}
            row={row}
            breakSeconds={breakSeconds}
            onStart={() => onStart(row)}
            onSkip={() => onSkip(row)}
            onUnskip={() => onUnskip(row)}
          />
        );
      })}
    </ul>
  );
}

/** How far a row has to travel before the swipe counts. */
const SWIPE_COMMIT = 70;
/** How far past the commit point the row is allowed to move. */
const SWIPE_MAX = 104;
/** Movement below this is a tap, not a drag. */
const SWIPE_SLOP = 6;

function TimelineRow({
  row,
  breakSeconds,
  onStart,
  onSkip,
  onUnskip,
}: {
  row: BreakSlot;
  breakSeconds: number;
  onStart: () => void;
  onSkip: () => void;
  onUnskip: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const dragged = useRef(false);

  // Skipped rows swipe right to restore; everything else swipes left to skip.
  const direction = row.status === 'skipped' ? 1 : -1;

  const meta =
    row.status === 'active'
      ? row.snoozed
        ? `Up next · snoozed from ${railTime(row.at)}`
        : row.movedByMeeting
          ? `Up next · moved from ${railTime(row.at)}`
          : 'Up next'
      : row.status === 'skipped'
        ? 'Skipped'
        : `${BODY_REGION_LABELS[row.exercise.region]} · ${formatDuration(
            breakSeconds,
          )}`;

  const commit = () => (row.status === 'skipped' ? onUnskip() : onSkip());

  const onPointerDown = (event: React.PointerEvent) => {
    startX.current = event.clientX;
    dragged.current = false;
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (startX.current === null) return;
    const delta = event.clientX - startX.current;

    if (!dragged.current && Math.abs(delta) > SWIPE_SLOP) {
      dragged.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!dragged.current) return;

    // Only travel in the direction this row's action lives.
    const travel = direction === -1 ? Math.min(0, delta) : Math.max(0, delta);
    setOffset(Math.sign(travel) * Math.min(SWIPE_MAX, Math.abs(travel)));
  };

  const onPointerUp = () => {
    const moved = Math.abs(offset);
    startX.current = null;
    setOffset(0);

    if (dragged.current) {
      if (moved >= SWIPE_COMMIT) commit();
      return;
    }
    // A plain tap starts the break that's up next, and does nothing elsewhere
    // so the timeline can't be cleared by accident.
    if (row.status === 'active') onStart();
  };

  return (
    <li className="tl-item">
      {/* Only present mid-swipe: the faded row states are translucent, and a
          label sitting behind them would show through. */}
      {offset !== 0 ? (
        <span
          className="tl-item__action"
          data-side={direction === -1 ? 'right' : 'left'}
        >
          {row.status === 'skipped' ? 'Restore' : 'Skip'}
        </span>
      ) : null}
      <div
        role="button"
        tabIndex={0}
        className={`tl-row tl-row--${row.status}`}
        style={{ transform: `translateX(${offset}px)` }}
        data-swiping={offset !== 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          startX.current = null;
          setOffset(0);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          if (row.status === 'active') onStart();
          else commit();
        }}
      >
        <span className="tl-row__time">{railTime(row.showsAt)}</span>
        <span className="tl-row__text">
          <span className="tl-row__name">{row.exercise.name}</span>
          <span className="tl-row__meta">{meta}</span>
        </span>
        <span className="tl-row__state">
          {row.status === 'active' ? (
            <PlayIcon size={13} />
          ) : row.status === 'skipped' ? (
            <DashIcon size={15} />
          ) : (
            <CheckIcon size={15} />
          )}
        </span>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Weekly coverage                                                     */
/* ------------------------------------------------------------------ */

/** The five columns the design shows, and which body areas feed each. */
const COVERAGE_GROUPS = [
  { label: 'Neck', regions: ['neck'] },
  { label: 'Back', regions: ['upperBack', 'lowerBack', 'shoulders'] },
  { label: 'Wrists', regions: ['wrists'] },
  { label: 'Hips', regions: ['hips'] },
  { label: 'Eyes', regions: ['eyes'] },
] as const;

function Coverage() {
  const coach = useCoachNoun();
  const { session } = useSession();
  const week = breaksThisWeek(session);

  const counts = COVERAGE_GROUPS.map((group) =>
    week.filter((entry) =>
      (group.regions as readonly string[]).includes(entry.region),
    ).length,
  );

  const untouched = COVERAGE_GROUPS.filter((_, index) => counts[index] === 0);
  const note =
    untouched.length === 0
      ? `Every area covered this week. Your ${coach} approves.`
      : `No ${untouched[0].label.toLowerCase()} work this week — your ${coach}'s judging, gently.`;

  return (
    <section className="coverage">
      <div className="eyebrow">This week&rsquo;s coverage</div>
      <div className="coverage__row">
        {COVERAGE_GROUPS.map((group, index) => (
          <span
            key={group.label}
            className="coverage__cell"
            data-level={Math.min(2, counts[index])}
          >
            {group.label}
          </span>
        ))}
      </div>
      <p className="coverage__note">{note}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tab bar                                                             */
/* ------------------------------------------------------------------ */

/** Only Today is built; the rest are sections D, H and I. */
const OTHER_TABS = [
  { label: 'Library', icon: <GridIcon size={20} /> },
  { label: 'Insights', icon: <ChartIcon size={20} /> },
  { label: 'You', icon: <PersonIcon size={20} /> },
] as const;

/**
 * Four tabs and no centre disc: the floating Start workout button now owns
 * "move right now", and two accent-coloured play buttons within 80px of each
 * other read as two different actions when they are one.
 */
export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      <button type="button" className="tab" aria-current="page">
        <TargetIcon size={20} />
        <span className="tab__label">Today</span>
      </button>

      {OTHER_TABS.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className="tab"
          aria-disabled="true"
          disabled
        >
          {tab.icon}
          <span className="tab__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
