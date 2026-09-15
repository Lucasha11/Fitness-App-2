import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChartIcon,
  CheckIcon,
  ChevronRightIcon,
  DashIcon,
  FlameIcon,
  GridIcon,
  PersonIcon,
  PlayIcon,
  ReplyIcon,
  TargetIcon,
} from '../components/icons';
import { COACH_LABEL, useCoach, useCoachNoun } from '../components/coach';
import { GoalRing } from '../components/GoalRing';
import { ActivityTrend } from './ActivityTrend';
import { useMotionReset } from '../health/useMotionReset';
import { Mascot } from '../components/Mascot';
import {
  EXERCISE_DURATION_SECONDS,
  type Exercise,
  formatDuration,
} from '../exercises';
import {
  BODY_REGION_LABELS,
  type OnboardingState,
  formatTime,
} from '../onboarding/state';
import { type BreakSlot, buildDay, nextBreak, pickExercises } from '../schedule';
import { useSession } from '../session/context';
import {
  breaksThisWeek,
  breaksToday,
  currentStreak,
  sittingMinutes,
} from '../session/state';
import './today.css';

/** Past this many sitting minutes the indicator turns amber (brief §B1.4). */
const SITTING_THRESHOLD = 45;

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

  const done = breaksToday(session).length;
  const goal = answers.dailyGoal;
  const streak = currentStreak(session);
  const sitting = sittingMinutes(session, answers, now.getTime());

  return (
    <div className="today">
      <div className="today__scroll">
        <Header
          now={now}
          streak={streak}
          done={done}
          goal={goal}
        />

        <div className="today__body">
          {upNext ? (
            <NextBreakCard
              slot={upNext}
              now={now}
              onStart={() => onStartBreak(upNext.exercise, upNext.at)}
              onSnooze={() => snoozeSlot(upNext.at, SNOOZE_MINUTES)}
            />
          ) : (
            <GoalMetCard
              answers={answers}
              onKeepGoing={(exercise) => onStartBreak(exercise, null)}
            />
          )}

          <SittingIndicator minutes={sitting} />

          <section>
            <div className="today__section-head">
              <h2 className="today__h2">Today&rsquo;s plan</h2>
              <span className="today__hint">Swipe a row to skip</span>
            </div>
            <Timeline
              rows={rows}
              onStart={(slot) => onStartBreak(slot.exercise, slot.at)}
              onSkip={(slot) => skipSlot(slot.at)}
              onUnskip={(slot) => unskipSlot(slot.at)}
            />
          </section>

          <Coverage />

          <ActivityTrend />
        </div>
      </div>

      <TabBar onBreak={() => {
        const exercise = upNext?.exercise ?? pickExercises(answers, 1)[0];
        onStartBreak(exercise, upNext?.at ?? null);
      }} />
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

function Header({
  now,
  streak,
  done,
  goal,
}: {
  now: Date;
  streak: number;
  done: number;
  goal: number;
}) {
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header className="today__header">
      <div className="today__greeting-row">
        <div>
          <div className="today__date">{dateLabel}</div>
          <h1 className="today__greeting">{greeting(now.getHours())}</h1>
        </div>
        <button
          type="button"
          className="streak"
          aria-label={`Current streak: ${streak} ${streak === 1 ? 'day' : 'days'}`}
        >
          <FlameIcon size={16} />
          {streak}
        </button>
      </div>

      <div className="today__ring-wrap">
        <GoalRing done={done} goal={goal} />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Next break                                                          */
/* ------------------------------------------------------------------ */

function NextBreakCard({
  slot,
  now,
  onStart,
  onSnooze,
}: {
  slot: BreakSlot;
  now: Date;
  onStart: () => void;
  onSnooze: () => void;
}) {
  const coach = useCoach();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const minutesAway = slot.showsAt - nowMinutes;

  const eyebrow =
    minutesAway <= 0
      ? 'NEXT BREAK IS DUE'
      : minutesAway < 60
        ? `NEXT BREAK IN ${minutesAway} MIN`
        : `NEXT BREAK AT ${formatTime(slot.showsAt)}`;

  return (
    <article className="next-card">
      <div className="next-card__top">
        <div className="next-card__text">
          <div className="next-card__eyebrow">{eyebrow}</div>
          <h2 className="next-card__name">{slot.exercise.name}</h2>
          <div className="next-card__chips">
            <span className="mini-chip mini-chip--area">
              {BODY_REGION_LABELS[slot.exercise.region]}
            </span>
            <span className="mini-chip">
              {formatDuration(EXERCISE_DURATION_SECONDS)}
            </span>
          </div>
        </div>
        <div className="next-card__art bob">
          <Mascot name="thumbsup" size={70} alt={`${COACH_LABEL[coach]} coach`} />
        </div>
      </div>

      <div className="next-card__actions">
        <button type="button" className="next-card__start" onClick={onStart}>
          Start now
        </button>
        <button type="button" className="next-card__snooze" onClick={onSnooze}>
          Snooze
        </button>
      </div>

      {slot.movedByMeeting ? (
        <p className="next-card__note">
          <ReplyIcon size={14} />
          Moved from {formatTime(slot.at)} to {formatTime(slot.showsAt)} to
          clear your meeting.
        </p>
      ) : null}
    </article>
  );
}

/** Shown once every scheduled break is done or skipped (brief §B3). */
function GoalMetCard({
  answers,
  onKeepGoing,
}: {
  answers: OnboardingState;
  onKeepGoing: (exercise: Exercise) => void;
}) {
  const coach = useCoach();
  const extra = pickExercises(answers, 1)[0];

  return (
    <article className="next-card">
      <div className="next-card__top">
        <div className="next-card__text">
          <div className="next-card__eyebrow">THAT&rsquo;S THE PLAN DONE</div>
          <h2 className="next-card__name">Anything extra is a bonus</h2>
          <div className="next-card__chips">
            <span className="mini-chip mini-chip--area">
              {BODY_REGION_LABELS[extra.region]}
            </span>
            <span className="mini-chip">
              {formatDuration(EXERCISE_DURATION_SECONDS)}
            </span>
          </div>
        </div>
        <div className="next-card__art bob">
          <Mascot name="thumbsup" size={70} alt={`${COACH_LABEL[coach]} coach`} />
        </div>
      </div>

      <div className="next-card__actions">
        <button
          type="button"
          className="next-card__start"
          onClick={() => onKeepGoing(extra)}
        >
          Keep going
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Sitting indicator                                                   */
/* ------------------------------------------------------------------ */

/**
 * `95` -> `1 hr 35 min`. Past an hour or so the minute count stops being
 * something anyone reads at a glance, and a four-digit one reads as a bug.
 */
function sittingLabel(minutes: number): string {
  if (minutes < 90) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourPart = `${hours} hr${hours === 1 ? '' : 's'}`;

  return rest === 0 ? hourPart : `${hourPart} ${rest} min`;
}

function SittingIndicator({ minutes }: { minutes: number }) {
  const warning = minutes >= SITTING_THRESHOLD;
  const label =
    minutes < 1
      ? 'You just got up — nice one'
      : `You've been sitting for ${sittingLabel(minutes)}`;

  return (
    <button
      type="button"
      className={`sitting${warning ? ' sitting--warning' : ''}`}
    >
      <span className="sitting__dot" />
      <span className="sitting__label">{label}</span>
      <ChevronRightIcon size={16} className="sitting__chevron" />
    </button>
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
  onStart,
  onSkip,
  onUnskip,
}: {
  rows: ReturnType<typeof buildDay>;
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
  onStart,
  onSkip,
  onUnskip,
}: {
  row: BreakSlot;
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
            EXERCISE_DURATION_SECONDS,
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

/** Only Today and Break are built; the rest are section D, H and I. */
const OTHER_TABS = [
  { label: 'Library', icon: <GridIcon size={20} /> },
  { label: 'Insights', icon: <ChartIcon size={20} /> },
  { label: 'You', icon: <PersonIcon size={20} /> },
] as const;

export function TabBar({ onBreak }: { onBreak: () => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <button type="button" className="tab" aria-current="page">
        <TargetIcon size={20} />
        <span className="tab__label">Today</span>
      </button>

      <button type="button" className="tab" aria-disabled="true" disabled>
        {OTHER_TABS[0].icon}
        <span className="tab__label">{OTHER_TABS[0].label}</span>
      </button>

      <button
        type="button"
        className="tab-break"
        aria-label="Start a break now"
        onClick={onBreak}
      >
        <span className="tab-break__disc">
          <PlayIcon size={26} />
        </span>
      </button>

      {OTHER_TABS.slice(1).map((tab) => (
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
