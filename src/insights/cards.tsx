import { useLayoutEffect, useState, type ReactNode } from 'react';
import {
  ChairIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlameIcon,
  PersonIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
} from '../components/icons';
import { BODY_REGION_LABELS, DAY_INITIALS } from '../onboarding/state';
import type { CompletedBreak } from '../session/state';
import type { CalendarDay, DayLevel, DayScore, Milestone, MilestoneId } from './progress';
import './insights.css';

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

/** `9 * 60` -> `9 AM`, `17 * 60 + 30` -> `5:30 PM`: an axis label. */
function hourLabel(minutes: number): string {
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  return minute === 0
    ? `${hour12} ${suffix}`
    : `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * The card's drawable width. The chart is drawn in real pixels rather than
 * scaled from a fixed viewBox, so its labels stay 11px on every phone.
 */
function useWidth<T extends HTMLElement>(fallback: number) {
  // A callback ref, not an object ref: the measured element comes and goes
  // (a day off has no strip), and the observer must follow the one on screen
  // rather than keep measuring a detached node at zero.
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(fallback);

  useLayoutEffect(() => {
    if (!element) return;
    // Observing reports the current size straight away, before paint.
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, width] as const;
}

/** The hour pills, drawn on the same x axis as whatever sits above them. */
function HourPills({
  score,
  x,
  y,
}: {
  score: DayScore;
  x: (minutes: number) => number;
  y: number;
}) {
  return (
    <>
      {score.hours.map((hour) => (
        <rect
          key={hour.start}
          className="chair-chart__hour"
          data-owner={hour.owner}
          x={x(hour.start) + 2}
          y={y}
          width={Math.max(0, x(hour.end) - x(hour.start) - 4)}
          height={12}
          rx={6}
        />
      ))}
    </>
  );
}

/** Start, end, and every third hour between that has room for its label. */
function axisLabels(start: number, end: number, x: (minutes: number) => number, width: number) {
  const labels: { at: number; anchor: 'start' | 'middle' | 'end' }[] = [
    { at: start, anchor: 'start' },
  ];
  for (let at = Math.ceil(start / 180) * 180; at < end; at += 180) {
    if (x(at) > 44 && x(at) < width - 44) labels.push({ at, anchor: 'middle' });
  }
  labels.push({ at: end, anchor: 'end' });
  return labels;
}

/* ------------------------------------------------------------------ */
/* You vs. The Chair                                                   */
/* ------------------------------------------------------------------ */

const CHART = { top: 18, base: 112, pills: 124, labels: 156, height: 160 };

function chairLine(score: DayScore): string {
  if (score.you === 0 && score.chair === 0) return 'Who’s winning today? Nobody yet.';
  if (score.you > score.chair) return 'Who’s winning today? You are.';
  if (score.you === score.chair) return 'Neck and neck. One break tips it.';
  return 'The chair’s having a good day. One break evens it up.';
}

/**
 * Today as a contest between the user and their chair: the score in hours,
 * the breaks climbing towards the goal, and the hours underneath on the same
 * clock, so a marker on the line always sits over the pill it won.
 */
export function ChairCard({
  score,
  goal,
  now,
  dayOff,
}: {
  score: DayScore;
  goal: number;
  /** Minutes from midnight, or null when there is no "now" on this day. */
  now: number | null;
  dayOff: boolean;
}) {
  return (
    <section className="insights-card chair" aria-labelledby="chair-title">
      <div className="chair__head">
        <span className="chair__icon">
          <ChairIcon size={24} />
        </span>
        <div>
          <h2 className="chair__title" id="chair-title">
            You vs. The Chair
          </h2>
          <p className="chair__line">
            {dayOff ? 'A day off. The chair gets one too.' : chairLine(score)}
          </p>
        </div>
      </div>

      {dayOff ? (
        <p className="insights-note">
          {score.breaks.length > 0
            ? `You still fitted in ${plural(score.breaks.length, 'break')}. Lovely.`
            : 'Nothing scheduled today, so nobody’s keeping score.'}
        </p>
      ) : (
        <>
          <div className="chair__score">
            <div className="chair__side" data-side="you">
              <span className="chair__who">You</span>
              <span className="chair__hours">
                {score.you} <small>{score.you === 1 ? 'hour' : 'hours'}</small>
              </span>
              <span className="chair__what">with a break</span>
            </div>
            <div className="chair__side" data-side="chair">
              <span className="chair__who">The chair</span>
              <span className="chair__hours">
                {score.chair} <small>{score.chair === 1 ? 'hour' : 'hours'}</small>
              </span>
              <span className="chair__what">sat straight through</span>
            </div>
          </div>

          <ChairChart score={score} goal={goal} now={now} />

          <div className="chair__legend" aria-hidden="true">
            <span className="chair__key" data-owner="you">Moved</span>
            <span className="chair__key" data-owner="chair">Sat through</span>
            <span className="chair__key" data-owner="ahead">Still ahead</span>
          </div>
        </>
      )}
    </section>
  );
}

function ChairChart({
  score,
  goal,
  now,
}: {
  score: DayScore;
  goal: number;
  now: number | null;
}) {
  const [ref, width] = useWidth<HTMLDivElement>(314);
  const { start, end, breaks } = score;
  const span = Math.max(1, end - start);
  const x = (minutes: number) => ((minutes - start) / span) * width;
  const ceiling = Math.max(goal, breaks.length, 1);
  const y = (count: number) => CHART.base - (count / ceiling) * (CHART.base - CHART.top);
  const at = (value: number) => Math.round(value * 10) / 10;

  // The line stops at "now" today, and runs to the end of a finished day.
  const nowInside = now !== null && now >= start && now <= end;
  const lineEnd = now === null ? end : Math.min(Math.max(now, start), end);

  let line = `M0,${CHART.base}`;
  breaks.forEach((minutes, index) => {
    line += ` L${at(x(minutes))},${at(y(index))} L${at(x(minutes))},${at(y(index + 1))}`;
  });
  line += ` L${at(x(lineEnd))},${at(y(breaks.length))}`;
  const area = `${line} L${at(x(lineEnd))},${CHART.base} Z`;

  const nowX = at(x(now ?? start));
  const goalY = at(y(goal));

  return (
    <div ref={ref} className="chair-chart">
      <svg
        width={width}
        height={CHART.height}
        viewBox={`0 0 ${width} ${CHART.height}`}
        role="img"
        aria-label={`${plural(breaks.length, 'break')} of ${goal} so far. You won ${plural(score.you, 'hour')}, the chair won ${plural(score.chair, 'hour')}.`}
      >
        <path className="chair-chart__goal" d={`M0,${goalY} H${width}`} />
        <text className="chair-chart__label" x={0} y={goalY + 14}>
          Goal {goal}
        </text>
        <path className="chair-chart__base" d={`M0,${CHART.base} H${width}`} />
        <path className="chair-chart__area" d={area} />
        <path className="chair-chart__line" d={line} />

        {nowInside ? (
          <>
            <path className="chair-chart__now" d={`M${nowX},${CHART.top - 2} V${CHART.base}`} />
            <text
              className="chair-chart__label chair-chart__label--now"
              x={nowX}
              y={11}
              textAnchor={nowX < 16 ? 'start' : nowX > width - 16 ? 'end' : 'middle'}
            >
              Now
            </text>
          </>
        ) : null}

        {breaks.map((minutes, index) => {
          const cx = at(x(minutes));
          const cy = at(y(index + 1));
          return (
            <g key={index}>
              <circle className="chair-chart__marker" cx={cx} cy={cy} r={8.5} />
              <path
                className="chair-chart__tick"
                d={`M${at(cx - 3.6)},${cy} l2.4,2.4 l4.6,-4.8`}
              />
            </g>
          );
        })}

        <HourPills score={score} x={x} y={CHART.pills} />

        {axisLabels(start, end, x, width).map((label) => (
          <text
            key={label.at}
            className="chair-chart__label"
            x={at(x(label.at))}
            y={CHART.labels}
            textAnchor={label.anchor}
          >
            {hourLabel(label.at)}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Streaks                                                             */
/* ------------------------------------------------------------------ */

export function StreakTiles({
  current,
  best,
  weeksOnTarget,
  hasDaysOff,
}: {
  current: number;
  best: number;
  weeksOnTarget: number;
  /** Only worth promising that days off are safe when there are some. */
  hasDaysOff: boolean;
}) {
  return (
    <section className="streaks" aria-labelledby="streaks-title">
      <h2 className="eyebrow insights__label" id="streaks-title">
        Streaks
      </h2>
      <div className="streaks__row">
        <StreakTile icon={<FlameIcon size={20} />} value={current} label="day streak" lead />
        <StreakTile icon={<TrophyIcon size={20} />} value={best} label="best streak" />
        <StreakTile
          icon={<TargetIcon size={20} />}
          value={weeksOnTarget}
          label={weeksOnTarget === 1 ? 'week on target' : 'weeks on target'}
        />
      </div>
      {hasDaysOff ? (
        <p className="insights__footnote">Days off in your schedule never break a streak.</p>
      ) : null}
    </section>
  );
}

function StreakTile({
  icon,
  value,
  label,
  lead = false,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  lead?: boolean;
}) {
  return (
    <div className="streak-tile" data-lead={lead}>
      <span className="streak-tile__icon">{icon}</span>
      <span className="streak-tile__value">{value}</span>
      <span className="streak-tile__label">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Month calendar                                                      */
/* ------------------------------------------------------------------ */

const LEVEL_WORDS: Record<DayLevel, string> = {
  perfect: 'every break',
  most: 'most breaks',
  some: 'some breaks',
  quiet: 'a quiet day',
  off: 'a day off',
  pending: 'still to come',
  future: 'still to come',
};

export function MonthCalendar({
  month,
  days,
  selectedKey,
  onSelect,
  onPrevious,
  onNext,
}: {
  /** The first of the month shown. */
  month: Date;
  days: (CalendarDay | null)[];
  selectedKey: string | null;
  onSelect: (day: CalendarDay) => void;
  /** Absent at the ends of the range, which disables that arrow. */
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const perfect = days.filter((day) => day?.level === 'perfect').length;
  const monthName = month.toLocaleDateString('en-GB', { month: 'long' });

  return (
    <section className="insights-card calendar" aria-labelledby="calendar-title">
      <div className="calendar__head">
        <button
          type="button"
          className="calendar__page"
          aria-label="Previous month"
          disabled={!onPrevious}
          onClick={onPrevious}
        >
          <ChevronLeftIcon size={20} />
        </button>
        <div className="calendar__title">
          <h2 className="calendar__month" id="calendar-title">
            {monthName}
          </h2>
          <span className="calendar__count">
            {perfect === 0 ? 'No perfect days yet' : plural(perfect, 'perfect day')}
          </span>
        </div>
        <button
          type="button"
          className="calendar__page"
          aria-label="Next month"
          disabled={!onNext}
          onClick={onNext}
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>

      <div className="calendar__weekdays" aria-hidden="true">
        {DAY_INITIALS.map((initial, index) => (
          <span key={index}>{initial}</span>
        ))}
      </div>

      <div className="calendar__grid">
        {days.map((day, index) =>
          day ? (
            <button
              key={day.key}
              type="button"
              className="calendar__day"
              data-level={day.level}
              data-today={day.isToday || undefined}
              aria-pressed={day.key === selectedKey}
              aria-label={`${day.date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}: ${day.isToday ? 'today, ' : ''}${LEVEL_WORDS[day.level]}`}
              disabled={!day.selectable}
              onClick={() => onSelect(day)}
            >
              {day.date.getDate()}
            </button>
          ) : (
            <span key={`blank-${index}`} aria-hidden="true" />
          ),
        )}
      </div>

      <div className="calendar__legend" aria-hidden="true">
        <span className="calendar__key" data-level="perfect">Every break</span>
        <span className="calendar__key" data-level="most">Most</span>
        <span className="calendar__key" data-level="some">Some</span>
        <span className="calendar__key" data-level="quiet">A quiet day</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The picked day                                                      */
/* ------------------------------------------------------------------ */

function dayHeadline(level: DayLevel, breaks: number, goal: number): string {
  switch (level) {
    case 'perfect':
      return breaks > goal ? 'Beyond the goal. Brilliant.' : 'Every break, a perfect day';
    case 'most':
    case 'some':
      return `${plural(breaks, 'break')} moved you`;
    case 'quiet':
      return 'A quiet day';
    case 'off':
      return 'A day off';
    case 'pending':
    case 'future':
      return 'Today’s still going';
  }
}

export function DayDetail({
  date,
  level,
  breaks,
  goal,
  score,
}: {
  date: Date;
  level: DayLevel;
  breaks: CompletedBreak[];
  goal: number;
  score: DayScore;
}) {
  const [ref, width] = useWidth<HTMLDivElement>(314);
  const span = Math.max(1, score.end - score.start);
  const x = (minutes: number) => ((minutes - score.start) / span) * width;
  const minutes = Math.round(breaks.reduce((total, entry) => total + entry.seconds, 0) / 60);
  const regions = [...new Set(breaks.map((entry) => entry.region))];
  const middle = score.start + Math.round(span / 60 / 2) * 60;

  return (
    <section className="insights-card day-detail" aria-live="polite">
      <div className="day-detail__head">
        <div>
          <span className="eyebrow">
            {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <h2 className="day-detail__title">{dayHeadline(level, breaks.length, goal)}</h2>
        </div>
        <span className="day-detail__count" data-perfect={level === 'perfect'}>
          {breaks.length} / {goal}
        </span>
      </div>

      {level === 'off' && breaks.length === 0 ? (
        <p className="insights-note">Rest is part of the plan too.</p>
      ) : (
        <>
          <div ref={ref}>
            <svg
              className="day-detail__strip"
              width={width}
              height={30}
              viewBox={`0 0 ${width} 30`}
              role="img"
              aria-label={`Moved in ${plural(score.you, 'hour')}, sat through ${plural(score.chair, 'hour')}.`}
            >
              <HourPills score={score} x={x} y={0} />
              <text className="chair-chart__label" x={0} y={28} textAnchor="start">
                {hourLabel(score.start)}
              </text>
              <text className="chair-chart__label" x={x(middle)} y={28} textAnchor="middle">
                {hourLabel(middle)}
              </text>
              <text className="chair-chart__label" x={width} y={28} textAnchor="end">
                {hourLabel(score.end)}
              </text>
            </svg>
          </div>

          {level === 'quiet' ? (
            <p className="insights-note">Some days run away with you. The next one’s a fresh start.</p>
          ) : null}

          {breaks.length > 0 ? (
            <div className="day-detail__chips">
              <span className="day-detail__chip">{minutes < 1 ? 'Under a minute' : `${minutes} min`} moved</span>
              {regions.map((region) => (
                <span key={region} className="day-detail__chip" data-area>
                  {BODY_REGION_LABELS[region]}
                </span>
              ))}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Milestones                                                          */
/* ------------------------------------------------------------------ */

const MILESTONE_ICONS: Record<MilestoneId, ReactNode> = {
  'first-break': <CheckIcon size={26} />,
  'perfect-day': <TargetIcon size={26} />,
  'streak-7': <FlameIcon size={26} />,
  'whole-body': <PersonIcon size={26} />,
  'breaks-100': <StarIcon size={26} />,
  'streak-30': <TrophyIcon size={26} />,
};

function milestoneDetail(milestone: Milestone): string {
  if (milestone.earnedOn) {
    const [year, month, day] = milestone.earnedOn.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }
  if (milestone.id === 'first-break') return 'Take your first';
  if (milestone.id === 'perfect-day') return `Best so far: ${milestone.current} of ${milestone.target}`;
  const unit = milestone.unit === 'day' ? ' days' : milestone.unit === 'area' ? ' areas' : '';
  return `${milestone.current} of ${milestone.target}${unit}`;
}

/** Circumference of the progress ring, r = 28 in a 64 box. */
const RING = 2 * Math.PI * 28;

export function MilestoneGrid({ milestones }: { milestones: Milestone[] }) {
  const earned = milestones.filter((milestone) => milestone.earnedOn).length;

  return (
    <section className="insights-card milestones" aria-labelledby="milestones-title">
      <div className="milestones__head">
        <h2 className="milestones__title" id="milestones-title">
          Milestones
        </h2>
        <span className="milestones__count">
          {earned} of {milestones.length}
        </span>
      </div>
      <ul className="milestones__grid">
        {milestones.map((milestone) => {
          const done = milestone.earnedOn !== null;
          const share = milestone.target > 0 ? milestone.current / milestone.target : 0;
          return (
            <li key={milestone.id} className="milestone" data-earned={done}>
              <span className="milestone__badge">
                {done ? null : (
                  <svg className="milestone__ring" width={64} height={64} viewBox="0 0 64 64" aria-hidden="true">
                    <circle className="milestone__track" cx={32} cy={32} r={28} />
                    {share > 0 ? (
                      <circle
                        className="milestone__arc"
                        cx={32}
                        cy={32}
                        r={28}
                        strokeDasharray={`${share * RING} ${RING}`}
                        transform="rotate(-90 32 32)"
                      />
                    ) : null}
                  </svg>
                )}
                <span className="milestone__icon">{MILESTONE_ICONS[milestone.id]}</span>
              </span>
              <span className="milestone__title">{milestone.title}</span>
              <span className="milestone__detail">
                {done ? `Earned ${milestoneDetail(milestone)}` : milestoneDetail(milestone)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
