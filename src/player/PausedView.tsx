import { CloseIcon } from '../components/icons';
import { ExerciseFigure } from '../components/ExerciseFigure';
import { type Exercise, formatClock } from '../exercises';
import { poseFor } from './poses';

/**
 * C5 · paused. The animation dims, the timer stays visible and frozen, and
 * the three ways out get equal billing with Resume on top.
 */
export function PausedView({
  exercise,
  remaining,
  position,
  total,
  discreet,
  onResume,
  onRestart,
  onEnd,
}: {
  exercise: Exercise;
  remaining: number;
  position: number;
  total: number;
  discreet: boolean;
  onResume: () => void;
  onRestart: () => void;
  onEnd: () => void;
}) {
  return (
    <section
      className={`player${discreet ? ' player--discreet' : ''}`}
      aria-label="Break paused"
    >
      <div className="player__top paused__top">
        <button
          type="button"
          className="player__icon-btn"
          aria-label="End break"
          onClick={onEnd}
        >
          <CloseIcon size={18} />
        </button>
        <span className="player__counter">
          {position} of {total}
        </span>
        {/* Balances the close button so the counter stays centred. */}
        <span style={{ width: 38 }} />
      </div>

      <div className="paused__stage">
        {/* Held on the drawn pose: a panda still moving would contradict
            the word PAUSED under it. */}
        <ExerciseFigure
          pose={poseFor(exercise)}
          size={250}
          alt="Paused exercise"
          still
        />
      </div>

      <div className="paused__readout">
        <div className="paused__label">PAUSED</div>
        <p className="paused__clock">{formatClock(remaining)}</p>
        <div className="paused__of">
          left on {exercise.name.toLowerCase()}
        </div>
      </div>

      <div className="paused__actions">
        <button type="button" className="paused__resume" onClick={onResume}>
          Resume
        </button>
        <div className="paused__row">
          <button type="button" className="paused__secondary" onClick={onRestart}>
            Restart exercise
          </button>
          <button type="button" className="paused__secondary" onClick={onEnd}>
            End break
          </button>
        </div>
      </div>
    </section>
  );
}
