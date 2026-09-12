import {
  average,
  observed,
  trend,
  type DailyActivity,
} from '../health/activity';
import type { MetricName } from '../health/plugin';
import { useActivity } from '../health/useActivity';

/** Two weeks, so the second week has something to be compared against. */
const WINDOW_DAYS = 14;
const TREND_DAYS = 7;

const METRICS: MetricName[] = ['steps', 'exerciseMinutes'];

/**
 * Movement read from HealthKit, next to the breaks MoveMate logged itself.
 *
 * The point of the section is honesty about provenance: these are the user's
 * real days, and the app renders nothing at all rather than a flat zero line
 * when there is no data to show.
 */
export function ActivityTrend() {
  const { status, days, message } = useActivity(WINDOW_DAYS, METRICS);

  // Nothing to say on a platform without HealthKit, and saying it would only
  // clutter the web build.
  if (status === 'unavailable') return null;

  return (
    <section className="activity">
      <div className="eyebrow">Movement from Apple Health</div>

      {status === 'loading' ? (
        <p className="activity__note">Reading your last two weeks…</p>
      ) : null}

      {status === 'empty' ? (
        <p className="activity__note">
          No movement data yet. If you didn&rsquo;t allow access, Health &rsaquo;
          Sharing &rsaquo; Apps can turn it back on.
        </p>
      ) : null}

      {status === 'error' ? (
        <p className="activity__note">Couldn&rsquo;t read Health data: {message}</p>
      ) : null}

      {status === 'ready' ? <Readings days={days} /> : null}
    </section>
  );
}

function Readings({ days }: { days: DailyActivity[] }) {
  const steps = average(days.slice(-TREND_DAYS), 'steps');
  const exercise = average(days.slice(-TREND_DAYS), 'exerciseMinutes');
  const stepTrend = trend(days, 'steps', TREND_DAYS);

  return (
    <>
      <div className="activity__row">
        <Stat
          label="Daily steps"
          value={steps === null ? null : Math.round(steps).toLocaleString()}
        />
        <Stat
          label="Exercise / day"
          value={exercise === null ? null : `${Math.round(exercise)} min`}
        />
      </div>

      <Sparkline days={days} />

      <p className="activity__note">{trendNote(stepTrend)}</p>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="activity__stat">
      <span className="activity__value">{value ?? '—'}</span>
      <span className="activity__label">{label}</span>
    </div>
  );
}

/**
 * Fourteen bars, each a day's steps against the busiest day in the window.
 * Days with no reading render as a gap rather than a zero-height bar, so a
 * missing day never reads as a day spent still.
 */
function Sparkline({ days }: { days: DailyActivity[] }) {
  const values = observed(days, 'steps');
  if (values.length === 0) return null;

  const peak = Math.max(...values);

  return (
    <div
      className="activity__chart"
      role="img"
      aria-label={`Steps over the last ${days.length} days, busiest day ${peak.toLocaleString()} steps`}
    >
      {days.map((day) => (
        <span
          key={day.date}
          className="activity__bar"
          data-missing={day.steps === null ? 'true' : undefined}
          style={
            day.steps === null
              ? undefined
              : { height: `${Math.max(6, (day.steps / peak) * 100)}%` }
          }
        />
      ))}
    </div>
  );
}

function trendNote(change: number | null): string {
  if (change === null) return 'One more week and we can show you a trend.';

  const percent = Math.abs(Math.round(change * 100));
  if (percent < 5) return 'Your step count is holding steady week on week.';

  return change > 0
    ? `You're moving ${percent}% more than last week. Keep it up.`
    : `You're moving ${percent}% less than last week — worth a few extra breaks.`;
}
