import { PlayIcon } from '../components/icons';
import { Mascot } from '../components/Mascot';
import './lockscreen.css';

/**
 * C10 · the notification, Live Activity and Lock Screen widgets.
 *
 * The brief asks for these as static mockups, and a web build has no lock
 * screen to put them on, so this is a reference surface rather than a screen
 * in the flow. It is reachable at `#lock-screen`.
 */
export function LockScreenPreview({ onExit }: { onExit: () => void }) {
  const now = new Date();
  const time = now
    .toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    .replace(/\s?(AM|PM)$/i, '');
  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <section className="lock" aria-label="Lock Screen surfaces">
      <button
        type="button"
        className="lock__clock"
        aria-label="Back to the app"
        onClick={onExit}
      >
        <div className="lock__date">{date}</div>
        <div className="lock__time">{time}</div>
      </button>

      {/* The break reminder, with its three inline actions. */}
      <div className="lock__notification">
        <div className="lock__notification-head">
          <span className="lock__notification-thumb">
            <Mascot name="pullups" size={38} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="lock__notification-meta">
              <span>MOVEMATE</span>
              <span>now</span>
            </span>
            <span className="lock__notification-title">
              Shoulder rolls, 45 seconds
            </span>
            <span className="lock__notification-body">
              You&rsquo;ve been sitting 58 min. Quick one?
            </span>
          </span>
        </div>
        <div className="lock__notification-actions">
          <span className="lock__action lock__action--primary">Start</span>
          <span className="lock__action">Snooze 10</span>
          <span className="lock__action">Skip</span>
        </div>
      </div>

      {/* The running break, as a Live Activity. */}
      <div className="lock__activity">
        <div className="lock__activity-head">
          <span className="lock__activity-icon">
            <PlayIcon size={20} />
          </span>
          <span style={{ flex: 1 }}>
            <span className="lock__activity-title">Shoulder rolls</span>
            <span className="lock__activity-sub">Break running · 2 of 3</span>
          </span>
          <span className="lock__activity-clock">0:28</span>
        </div>
        <div className="lock__activity-bar">
          <div className="lock__activity-fill" style={{ width: '64%' }} />
        </div>
        <div className="lock__activity-actions">
          <span className="lock__action lock__action--ghost">Pause</span>
          <span className="lock__action lock__action--ghost">Skip</span>
        </div>
      </div>

      {/* Circular and rectangular Lock Screen widgets. */}
      <div className="lock__widgets">
        <div className="lock__widget">
          <span className="lock__widget-ring" />
          <span className="lock__widget-text">
            3/6
            <br />
            <span className="lock__widget-unit">breaks</span>
          </span>
        </div>
        <div className="lock__widget lock__widget--wide">
          Next break 2:15
          <br />
          Neck rolls
        </div>
      </div>

      <p className="lock__caption">
        Lock Screen widgets · circular &amp; rectangular
      </p>
    </section>
  );
}
