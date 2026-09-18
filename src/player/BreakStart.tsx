import { useCallback, useEffect, useRef, useState } from 'react';
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

/** How long the screen waits before starting the break on its own. */
const AUTO_START_MS = 5000;

/** How often the countdown redraws. Fine enough that the ring reads smooth. */
const TICK_MS = 60;

/** Radius of the ring drawn around the coach's halo, and its circumference. */
const RING_RADIUS = 116;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

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
 * A ring drains around the coach for five seconds and then starts the break on
 * its own, so someone who only wanted to move never has to tap anything. The
 * ring stops at the first sign of a person — a tap, a key, focus landing on a
 * control, the app going away — and never resumes: a countdown you have to
 * keep fighting is worse than none, and an earlier two-second version of this
 * screen made the options underneath it unreachable for anyone who paused to
 * read.
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
  const [elapsed, setElapsed] = useState(0);
  const [held, setHeld] = useState(false);
  const coach = useCoach();
  const totalSeconds = sequence.length * exerciseSeconds;

  /*
   * Set once, on the first tick rather than on every run of the effect below,
   * so a re-render can never quietly hand the user another five seconds.
   */
  const deadline = useRef(0);

  /* The ring is the one thing here that moves on its own. */
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const hold = useCallback(() => setHeld(true), []);

  useEffect(() => {
    if (held) return undefined;
    if (deadline.current === 0) deadline.current = Date.now() + AUTO_START_MS;

    const timer = window.setInterval(() => {
      const left = deadline.current - Date.now();
      if (left <= 0) {
        window.clearInterval(timer);
        onStart();
        return;
      }
      setElapsed(AUTO_START_MS - left);
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [held, onStart]);

  // Coming back to a screen that started the break while you were away would
  // be its own kind of rude.
  useEffect(() => {
    if (held) return undefined;

    const onHidden = () => {
      if (document.hidden) setHeld(true);
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [held]);

  const secondsLeft = Math.max(
    1,
    Math.ceil((AUTO_START_MS - elapsed) / 1000),
  );

  return (
    <section
      className="player"
      aria-label={`Start ${exercise.name}`}
      // Capture, so a tap holds the countdown wherever it lands — including on
      // a control that stops the event before it reaches us.
      onPointerDownCapture={hold}
      onKeyDownCapture={hold}
      onFocusCapture={hold}
    >
      <p className="sr-only" role="status">
        {held
          ? 'Countdown stopped.'
          : 'Starting in five seconds. Touch the screen to stay here.'}
      </p>

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
        <div className="start__halo-wrap">
          {/*
            The coach bobs inside the halo rather than the halo bobbing, the
            way the player does it: the countdown ring sits on the halo's edge,
            and a circle drifting in and out of a static ring reads as a bug.
          */}
          <div className="start__halo">
            <Mascot
              name={poseFor(exercise)}
              size={200}
              alt={`${COACH_LABEL[coach]} coach`}
              className="bob"
            />
          </div>

          {/*
            The countdown stays mounted once held so it can fade rather than
            vanish; `aria-hidden` throughout, because the live region above is
            what actually says any of this out loud.
          */}
          <div
            className={`start__countdown${held ? ' start__countdown--held' : ''}`}
            aria-hidden="true"
          >
            {reducedMotion ? null : (
              <svg className="start__ring" viewBox="0 0 248 248">
                <circle
                  cx="124"
                  cy="124"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="oklch(0.99 0.005 100 / 10%)"
                  strokeWidth="6"
                />
                <circle
                  cx="124"
                  cy="124"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="var(--lime)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={RING_LENGTH}
                  strokeDashoffset={(elapsed / AUTO_START_MS) * RING_LENGTH}
                />
              </svg>
            )}

            <span className="start__badge">{secondsLeft}</span>
          </div>
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
