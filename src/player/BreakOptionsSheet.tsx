import { useEffect, useRef } from 'react';
import { MusicIcon, StopwatchIcon } from '../components/icons';
import { Segmented, ToggleRow } from '../components/ui';
import {
  EXERCISE_DURATION_CHOICES,
  formatClock,
  type ExerciseDuration,
} from '../exercises';
import { musicAvailable } from './music';

interface BreakOptionsSheetProps {
  /** Exercises in the break the options are being set for. */
  count: number;
  musicOn: boolean;
  onMusicChange: (on: boolean) => void;
  exerciseSeconds: ExerciseDuration;
  onSecondsChange: (seconds: ExerciseDuration) => void;
  onClose: () => void;
}

/**
 * The footer the start screen raises from "See other options": the handful of
 * things worth changing about a break before it starts, and nothing else.
 *
 * Both settings apply immediately rather than behind an Apply button — the
 * total on the start button ticks over as the user chooses, which is the whole
 * point of the time control.
 */
export function BreakOptionsSheet({
  count,
  musicOn,
  onMusicChange,
  exerciseSeconds,
  onSecondsChange,
  onClose,
}: BreakOptionsSheetProps) {
  const panel = useRef<HTMLDivElement>(null);

  // Focus the panel itself so Escape works before anything is tabbed to.
  useEffect(() => {
    panel.current?.focus();
  }, []);

  return (
    <div className="opt-sheet">
      <button
        type="button"
        className="opt-sheet__scrim"
        aria-label="Close options"
        onClick={onClose}
      />

      <div
        ref={panel}
        className="opt-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Break options"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose();
        }}
      >
        <div className="opt-sheet__grabber" aria-hidden="true" />
        <p className="opt-sheet__title">Break options</p>

        <div className="opt-sheet__rows">
          <ToggleRow
            title="Play music"
            subtitle={
              musicAvailable()
                ? 'A quiet loop under the exercises'
                : 'Saved for when the track lands'
            }
            icon={<MusicIcon size={19} />}
            iconBackground="var(--mint)"
            iconColor="var(--ink)"
            on={musicOn}
            onToggle={() => onMusicChange(!musicOn)}
          />
        </div>

        <div className="opt-sheet__block">
          <div className="opt-sheet__block-head">
            <span className="opt-sheet__icon">
              <StopwatchIcon size={19} />
            </span>
            <span className="opt-sheet__block-text">
              <span className="opt-sheet__block-title">Total time</span>
              <span className="opt-sheet__block-sub">
                {count} exercises · {exerciseSeconds} sec each
              </span>
            </span>
          </div>

          <Segmented
            label="Total break time"
            value={exerciseSeconds}
            onChange={(seconds) => onSecondsChange(seconds as ExerciseDuration)}
            options={EXERCISE_DURATION_CHOICES.map((seconds) => ({
              value: seconds as number,
              label: formatClock(count * seconds),
            }))}
          />
        </div>

        <button type="button" className="opt-sheet__done" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
