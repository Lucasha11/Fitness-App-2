import { useEffect, useMemo, useState } from 'react';
import { Mascot } from '../components/Mascot';
import { type Tab, TabBar } from '../components/TabBar';
import { Segmented } from '../components/ui';
import type { OnboardingState } from '../onboarding/state';
import { useSession } from '../session/context';
import {
  bestStreak,
  currentStreak,
  dateKey,
  fromDateKey,
  isDayOff,
} from '../session/state';
import { ChairCard, DayDetail, MilestoneGrid, MonthCalendar, StreakTiles } from './cards';
import {
  dayLevel,
  dayScore,
  firstDay,
  milestones,
  monthDays,
  monthRange,
  weeksOnTarget,
} from './progress';

type View = 'today' | 'progress';

const VIEWS: { value: View; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'progress', label: 'Progress' },
];

/** Often enough that the chair's hour lands close to when it is won. */
const TICK_MS = 20_000;

interface InsightsProps {
  answers: OnboardingState;
  onSelectTab: (tab: Tab) => void;
}

/**
 * H · Insights, in two halves: Today is the contest with the chair and the
 * streak it feeds, Progress is the longer view of the calendar and the
 * milestones.
 */
export function Insights({ answers, onSelectTab }: InsightsProps) {
  const [view, setView] = useState<View>('today');

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="insights">
      <div className="insights__scroll">
        <header className="insights__head">
          <div className="insights__heading">
            <span className="eyebrow">
              {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <h1 className="insights__title">Insights</h1>
          </div>
          <Mascot name="stand" size={80} alt="" className="insights__coach" />
        </header>

        <div className="insights__switch">
          <Segmented label="Insights view" options={VIEWS} value={view} onChange={setView} />
        </div>

        <div className="insights__body">
          {view === 'today' ? (
            <TodayView answers={answers} now={now} />
          ) : (
            <ProgressView answers={answers} now={now} />
          )}
        </div>
      </div>

      <TabBar current="insights" onSelect={onSelectTab} />
    </div>
  );
}

function TodayView({ answers, now }: { answers: OnboardingState; now: Date }) {
  const { session } = useSession();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const score = dayScore(answers, session.history[dateKey(now)] ?? [], nowMinutes);

  return (
    <>
      <ChairCard
        score={score}
        goal={answers.dailyGoal}
        now={nowMinutes}
        dayOff={isDayOff(now, answers.activeDays)}
      />
      <StreakTiles
        current={currentStreak(session, answers.activeDays, now)}
        best={bestStreak(session, answers.activeDays, now)}
        weeksOnTarget={weeksOnTarget(session, answers, now)}
        hasDaysOff={answers.activeDays.some((on) => !on)}
      />
    </>
  );
}

function ProgressView({ answers, now }: { answers: OnboardingState; now: Date }) {
  const { session } = useSession();
  const range = monthRange(session, answers, now);
  const [month, setMonth] = useState(range.last);
  const [selected, setSelected] = useState(() => dateKey(now));

  const days = useMemo(
    () => monthDays(session, answers, month.getFullYear(), month.getMonth(), now),
    [session, answers, month, now],
  );
  const list = useMemo(() => milestones(session, answers, now), [session, answers, now]);

  const page = (step: number) => new Date(month.getFullYear(), month.getMonth() + step, 1);

  const picked = fromDateKey(selected);
  const breaks = session.history[selected] ?? [];
  const isToday = selected === dateKey(now);
  const level = dayLevel(breaks.length, answers.dailyGoal, picked, {
    today: now,
    start: firstDay(session, answers),
    dayOff: isDayOff(picked, answers.activeDays),
  });

  return (
    <>
      <MonthCalendar
        month={month}
        days={days}
        selectedKey={selected}
        onSelect={(day) => setSelected(day.key)}
        onPrevious={month > range.first ? () => setMonth(page(-1)) : undefined}
        onNext={month < range.last ? () => setMonth(page(1)) : undefined}
      />
      <DayDetail
        date={picked}
        level={level}
        breaks={breaks}
        goal={answers.dailyGoal}
        score={dayScore(
          answers,
          breaks,
          isToday ? now.getHours() * 60 + now.getMinutes() : null,
        )}
      />
      <MilestoneGrid milestones={list} />
    </>
  );
}
