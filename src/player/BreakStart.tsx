import { useState } from 'react';
import { ChevronRightIcon, CloseIcon, SwapIcon } from '../components/icons';
import { COACH_LABEL, useCoach } from '../components/coach';
import { Mascot } from '../components/Mascot';
import {
  formatClock,
  formatDuration,
  type Exercise,
  type ExerciseDuration,
} from '../exercises';
import { BODY_REGION_LABELS } from '../onboarding/state';
import { BreakOptionsSheet } from './BreakOptionsSheet';
import { poseFor } from './poses';

interface BreakStartProps {
  exercise: Exercise;
  sequence: Exercise[];
  /** Plain-language reason this exercise came up now. */
  why: string;
  /** How long each exercise in the break will run. */
  exerciseSeconds: ExerciseDuration;
  musicOn: boolean;
  onStart: () => void;
  onSwap: () => void;
  onOverview: () => void;
  onMusicChange: (on: boolean) => void;
  onSecondsChange: (seconds: ExerciseDuration) => void;
  onClose: () => void;
}

/**
 * C1 · the screen between tapping an exercise and moving: what you are about
 * to do, why, how long it will take, and the two ways forward — start it, or
 * change something about it first.
 *
 * It waits. An earlier version auto-advanced after two seconds, which made the
 * options underneath it unreachable for anyone who paused to read the screen.
 */
export function BreakStart({
  exercise,
  sequence,
  why,
  exerciseSeconds,
  musicOn,
  onStart,
  onSwap,
  onOverview,
  onMusicChange,
  onSecondsChange,
  onClose,
}: BreakStartProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const coach = useCoach();
  const totalSeconds = sequence.length * exerciseSeconds;

  return (
    <section className="player" aria-label={`Start ${exercise.name}`}>
      <div className="start__top">
        <button
          type="button"
          className="player__icon-btn"
          aria-label="Cancel this break"
          onClick={onClose}
        >
          <CloseIcon size={18} />
        </button>
        <button type="button" className="start__swap" onClick={onSwap}>
          <SwapIcon size={15} />
          Swap
        </button>
      </div>

      <div className="start__body">
        <div className="start__halo bob">
          <Mascot
            name={poseFor(exercise)}
            size={200}
            alt={`${COACH_LABEL[coach]} coach`}
          />
        </div>

        <div>
          <h1 className="start__name">{exercise.name}</h1>
          <div className="start__chips">
            <span className="start__chip start__chip--area">
              {BODY_REGION_LABELS[exercise.region]}
            </span>
            <span className="start__chip">{formatDuration(exerciseSeconds)}</span>
            <span className="start__chip">
              {exercise.subtle ? 'Seated' : 'Standing'}
            </span>
          </div>
        </div>

        <p className="start__why">{why}</p>
      </div>

      <button type="button" className="start__sequence" onClick={onOverview}>
        <span>
          {sequence.length} exercises · {formatClock(totalSeconds)} total
        </span>
        <ChevronRightIcon size={18} />
      </button>

      <button type="button" className="start__go" onClick={onStart}>
        <span className="start__go-label">Start now</span>
        <span className="start__go-total">{formatClock(totalSeconds)}</span>
      </button>

      <button
        type="button"
        className="start__more"
        aria-haspopup="dialog"
        aria-expanded={optionsOpen}
        onClick={() => setOptionsOpen(true)}
      >
        See other options
      </button>

      {optionsOpen ? (
        <BreakOptionsSheet
          count={sequence.length}
          musicOn={musicOn}
          onMusicChange={onMusicChange}
          exerciseSeconds={exerciseSeconds}
          onSecondsChange={onSecondsChange}
          onClose={() => setOptionsOpen(false)}
        />
      ) : null}
    </section>
  );
}
