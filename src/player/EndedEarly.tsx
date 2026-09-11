import { DashIcon, StopwatchIcon, SwapIcon } from '../components/icons';
import { Mascot } from '../components/Mascot';
import { formatTime } from '../onboarding/state';

/** How far "remind me in 10" pushes the break. */
export const REMIND_MINUTES = 10;

/**
 * C8 · the non-judgemental exit. Nothing here scolds, and every option is a
 * way back in rather than a way out.
 */
export function EndedEarly({
  remainingToday,
  remindAt,
  onRemind,
  onSkipRest,
  onWrongExercise,
  onDismiss,
}: {
  /** How many breaks are still on today's plan. */
  remainingToday: number;
  /** Minutes from midnight the reminder would land at. */
  remindAt: number;
  onRemind: () => void;
  onSkipRest: () => void;
  onWrongExercise: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="sheet-screen">
      <button
        type="button"
        className="sheet-screen__backdrop sheet-screen__backdrop--dim"
        aria-label="Close"
        onClick={onDismiss}
      >
        <Mascot name="water" size={220} />
      </button>

      <div className="sheet" role="dialog" aria-label="Break ended early">
        <div className="sheet__grabber" />
        <h2 className="sheet__title sheet__title--lg">No problem.</h2>
        <p className="sheet__sub sheet__sub--lg">
          Skipping one break doesn&rsquo;t undo anything.
        </p>

        <div className="sheet__options">
          <button type="button" className="sheet-option" onClick={onRemind}>
            <span
              className="sheet-option__icon"
              style={{ background: 'var(--mint)' }}
            >
              <StopwatchIcon size={19} />
            </span>
            <span style={{ flex: 1 }}>
              <span className="sheet-option__title">
                Remind me in {REMIND_MINUTES}
              </span>
              <span className="sheet-option__sub">
                We&rsquo;ll try again at {formatTime(remindAt)}
              </span>
            </span>
          </button>

          <button type="button" className="sheet-option" onClick={onSkipRest}>
            <span
              className="sheet-option__icon"
              style={{ background: 'var(--fill)', color: 'var(--ink-muted)' }}
            >
              <DashIcon size={19} />
            </span>
            <span style={{ flex: 1 }}>
              <span className="sheet-option__title">
                Skip today&rsquo;s remaining
              </span>
              <span className="sheet-option__sub">
                {remainingToday} break{remainingToday === 1 ? '' : 's'} left today
              </span>
            </span>
          </button>

          <button
            type="button"
            className="sheet-option"
            onClick={onWrongExercise}
          >
            <span
              className="sheet-option__icon"
              style={{ background: 'var(--lime)', color: 'var(--lime-ink)' }}
            >
              <SwapIcon size={19} />
            </span>
            <span style={{ flex: 1 }}>
              <span className="sheet-option__title">
                It was the wrong exercise
              </span>
              <span className="sheet-option__sub">Pick a different one</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
