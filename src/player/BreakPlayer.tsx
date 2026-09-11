import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CloseIcon,
  PauseIcon,
  SoundOffIcon,
  SoundOnIcon,
  SwapIcon,
} from '../components/icons';
import { COACH_LABEL, useCoach } from '../components/coach';
import { Mascot } from '../components/Mascot';
import type { Exercise } from '../exercises';
import {
  BODY_REGION_LABELS,
  type BodyRegion,
  type OnboardingState,
} from '../onboarding/state';
import { buildDay, buildSequence, pickExercises, swapExercise } from '../schedule';
import { useSession } from '../session/context';
import {
  breaksToday,
  currentStreak,
  movedSecondsToday,
  sittingMinutes,
  type FeedbackVerdict,
} from '../session/state';
import { BreakComplete } from './BreakComplete';
import { BreakIntro } from './BreakIntro';
import { EndedEarly, REMIND_MINUTES } from './EndedEarly';
import { FeedbackSheet } from './FeedbackSheet';
import { PausedView } from './PausedView';
import { RestBetween } from './RestBetween';
import { SequenceOverview } from './SequenceOverview';
import { SwitchSides } from './SwitchSides';
import { playCue } from './cues';
import { LinearTimer, RingTimer } from './timers';
import { poseFor } from './poses';
import './player.css';

/**
 * The stages of a break, C1 through C8. `running` is C2; `paused` is C5 and is
 * a stage of its own because the design replaces the whole screen.
 */
type Stage =
  | 'intro'
  | 'overview'
  | 'running'
  | 'paused'
  | 'switch'
  | 'rest'
  | 'complete'
  | 'feedback'
  | 'endedEarly';

interface BreakPlayerProps {
  answers: OnboardingState;
  /** The exercise the break opens on. */
  lead: Exercise;
  /** The scheduled slot this break satisfies, if it came from the plan. */
  slot: number | null;
  /** Leaving the player, whether finished or abandoned. */
  onExit: () => void;
}

export function BreakPlayer({ answers, lead, slot, onExit }: BreakPlayerProps) {
  const {
    session,
    completeBreak,
    skipSlots,
    snoozeSlot,
    recordFeedback,
    excludeExercise,
    restRegion,
    setSoundOn,
  } = useSession();
  const coach = useCoach();

  const [sequence, setSequence] = useState<Exercise[]>(() =>
    buildSequence(answers, lead, session),
  );
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(() => sequence[0].seconds);
  const [stage, setStage] = useState<Stage>('intro');
  const [toast, setToast] = useState<string | null>(null);

  const current = sequence[index];
  const discreet = answers.visibility === 'open';
  // Discreet mode is silent by definition (brief §C2).
  const soundOn = session.soundOn && !discreet;

  // The countdown is owned by the interval below; this mirror lets a resumed
  // timer pick up exactly where the paused one left off.
  const remainingRef = useRef(remaining);
  /** Seconds actually moved: exercises that ran down, not ones skipped. */
  const movedRef = useRef(0);
  /** Whether this exercise's switch-sides prompt has already fired. */
  const switchedRef = useRef(false);

  const cue = useCallback(
    (kind: 'start' | 'halfway' | 'end') => {
      if (soundOn) playCue(kind);
    },
    [soundOn],
  );

  /* ---------------------------------------------------------------- */
  /* Stage transitions                                                 */
  /* ---------------------------------------------------------------- */

  const goToExercise = useCallback(
    (nextIndex: number, items = sequence) => {
      setIndex(nextIndex);
      remainingRef.current = items[nextIndex].seconds;
      setRemaining(remainingRef.current);
      switchedRef.current = false;
      setStage('running');
    },
    [sequence],
  );

  /** Bank the break and show C6. */
  const finish = useCallback(() => {
    if (movedRef.current === 0) {
      // Every exercise was skipped: they were here, but they didn't move.
      onExit();
      return;
    }
    const now = new Date();
    completeBreak({
      exerciseId: current.id,
      region: current.region,
      at: now.getHours() * 60 + now.getMinutes(),
      slot,
      seconds: movedRef.current,
    });
    setStage('complete');
  }, [completeBreak, current, slot, onExit]);

  /** Move on from the current exercise, with or without crediting it. */
  const advance = useCallback(
    (credited: boolean) => {
      if (credited) movedRef.current += current.seconds;

      if (index >= sequence.length - 1) {
        finish();
        return;
      }
      setStage(credited ? 'rest' : 'running');
      if (!credited) goToExercise(index + 1);
    },
    [current.seconds, index, sequence.length, finish, goToExercise],
  );

  /* ---------------------------------------------------------------- */
  /* The countdown                                                     */
  /* ---------------------------------------------------------------- */

  // Announce the start of each exercise.
  useEffect(() => {
    if (stage !== 'running') return;
    cue('start');
  }, [index, stage, cue]);

  /*
   * Everything that happens on a tick — the switch-sides prompt, the halfway
   * cue, the end of the exercise — happens here in the timer callback rather
   * than in an effect watching `remaining`, so pausing genuinely freezes the
   * break instead of just stopping the number from changing.
   */
  useEffect(() => {
    if (stage !== 'running') return undefined;

    const total = current.seconds;
    const halfway = Math.floor(total / 2);
    let left = remainingRef.current;

    const timer = window.setInterval(() => {
      left = Math.max(0, left - 1);
      remainingRef.current = left;
      setRemaining(left);

      if (left === halfway) {
        cue('halfway');
        if (current.sides && !switchedRef.current) {
          switchedRef.current = true;
          window.clearInterval(timer);
          setStage('switch');
          return;
        }
      }

      if (left === 0) {
        window.clearInterval(timer);
        cue('end');
        advance(true);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage, index, current.seconds, current.sides, cue, advance]);

  /* ---------------------------------------------------------------- */
  /* Controls                                                          */
  /* ---------------------------------------------------------------- */

  /** Swap an exercise for another that works the same body area. */
  const swapAt = useCallback(
    (position: number) => {
      // Never swap into something already queued in this same break.
      const queued = new Set(
        sequence.filter((_, i) => i !== position).map((item) => item.id),
      );
      const replacement = swapExercise(sequence[position], session, queued);
      if (replacement.id === sequence[position].id) return;

      setSequence((items) =>
        items.map((item, i) => (i === position ? replacement : item)),
      );

      // Swapping the exercise that's on screen restarts its clock.
      if (position === index) {
        remainingRef.current = replacement.seconds;
        setRemaining(replacement.seconds);
        switchedRef.current = false;
      }
    },
    [sequence, index, session],
  );

  const reorder = useCallback(
    (from: number, to: number) => {
      setSequence((items) => {
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
      // Keep pointing at whatever is now in the current position.
      if (from === index) setIndex(to);
      else if (from < index && to >= index) setIndex(index - 1);
      else if (from > index && to <= index) setIndex(index + 1);
    },
    [index],
  );

  const restartExercise = () => {
    remainingRef.current = current.seconds;
    setRemaining(current.seconds);
    switchedRef.current = false;
    setStage('running');
  };

  /** How many breaks are still outstanding today, for the C8 copy. */
  const remainingSlots = useMemo(
    () =>
      buildDay(answers, session)
        .filter(
          (row) =>
            row.kind === 'break' &&
            (row.status === 'active' || row.status === 'upcoming'),
        )
        .map((row) => (row.kind === 'break' ? row.at : 0)),
    [answers, session],
  );

  const handleFeedback = (verdict: FeedbackVerdict, region?: BodyRegion) => {
    recordFeedback({
      exerciseId: current.id,
      verdict,
      region,
      at: new Date().toISOString(),
    });

    if (verdict === 'awkward') {
      excludeExercise(current.id);
      setToast(`Got it, we'll drop ${current.name.toLowerCase()}.`);
    } else if (verdict === 'hurt' && region) {
      restRegion(region, 7);
      setToast(
        `Got it, we'll go easier on ${BODY_REGION_LABELS[region].toLowerCase()}.`,
      );
    } else if (verdict === 'easy') {
      setToast("Noted — we'll push a bit harder.");
    } else if (verdict === 'hard') {
      setToast("Noted — we'll take it gentler.");
    } else {
      setToast('Noted — more like that.');
    }
  };

  // The confirmation toast is the last thing on screen before we leave.
  useEffect(() => {
    if (toast === null) return undefined;
    const timer = window.setTimeout(onExit, 1600);
    return () => window.clearTimeout(timer);
  }, [toast, onExit]);

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  if (toast !== null) {
    return (
      <div className="sheet-screen">
        <div className="sheet-screen__backdrop sheet-screen__backdrop--dim">
          <Mascot name="thumbsup" size={220} />
        </div>
        <div className="toast" role="status">
          {toast}
        </div>
      </div>
    );
  }

  if (stage === 'overview') {
    return (
      <SequenceOverview
        sequence={sequence}
        currentIndex={index}
        onReorder={reorder}
        onSwap={swapAt}
        onBack={() => setStage('intro')}
      />
    );
  }

  if (stage === 'intro') {
    // Name the area this exercise actually works, and only claim the user
    // picked it if they did.
    const area = BODY_REGION_LABELS[current.region].toLowerCase();
    const chosen = answers.bothers.includes(current.region);
    const sat = sittingMinutes(session);

    const why = chosen
      ? sat >= 5
        ? `You picked ${area}, and you've been sitting ${sat} minutes. Seemed like a good moment.`
        : `You picked ${area}, so this one keeps that ticking over.`
      : sat >= 5
        ? `You've been sitting ${sat} minutes, and your ${area} could use it.`
        : `A quick one for your ${area} to break up the sitting.`;

    return (
      <BreakIntro
        exercise={current}
        sequence={sequence}
        why={why}
        onStart={() => setStage('running')}
        onSwap={() => swapAt(index)}
        onOverview={() => setStage('overview')}
        onClose={onExit}
      />
    );
  }

  if (stage === 'paused') {
    return (
      <PausedView
        exercise={current}
        remaining={remaining}
        position={index + 1}
        total={sequence.length}
        discreet={discreet}
        onResume={() => setStage('running')}
        onRestart={restartExercise}
        onEnd={() => setStage('endedEarly')}
      />
    );
  }

  if (stage === 'rest') {
    const next = sequence[index + 1];
    return (
      <RestBetween next={next} onDone={() => goToExercise(index + 1)} />
    );
  }

  if (stage === 'complete') {
    return (
      <BreakComplete
        doneToday={breaksToday(session).length}
        goal={answers.dailyGoal}
        movedSeconds={movedSecondsToday(session)}
        streak={currentStreak(session)}
        onDone={onExit}
        onOneMore={() => {
          const next = pickExercises(answers, 1, session)[0];
          setSequence(buildSequence(answers, next, session));
          setIndex(0);
          movedRef.current = 0;
          remainingRef.current = next.seconds;
          setRemaining(next.seconds);
          switchedRef.current = false;
          setStage('intro');
        }}
        onFeedback={() => setStage('feedback')}
      />
    );
  }

  if (stage === 'feedback') {
    return (
      <FeedbackSheet
        exercise={current}
        onSend={handleFeedback}
        onDismiss={onExit}
      />
    );
  }

  if (stage === 'endedEarly') {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    return (
      <EndedEarly
        remainingToday={remainingSlots.length}
        remindAt={nowMinutes + REMIND_MINUTES}
        onRemind={() => {
          if (slot !== null) snoozeSlot(slot, REMIND_MINUTES);
          onExit();
        }}
        onSkipRest={() => {
          skipSlots(remainingSlots);
          onExit();
        }}
        onWrongExercise={() => setStage('overview')}
        onDismiss={onExit}
      />
    );
  }

  /* stage === 'running' or 'switch' — C2, with C3 layered over it. */

  const progress = 1 - remaining / current.seconds;
  const showingSwitch = stage === 'switch';

  return (
    <section
      className={`player${discreet ? ' player--discreet' : ''}`}
      aria-label={`Break in progress: ${current.name}`}
      style={{ position: 'absolute' }}
    >
      <div className={showingSwitch ? 'player__under' : undefined}>
        <div className="player__top">
          <button
            type="button"
            className="player__icon-btn"
            aria-label="End break"
            onClick={() => setStage('endedEarly')}
          >
            <CloseIcon size={18} />
          </button>

          <span className="player__counter">
            {index + 1} of {sequence.length}
          </span>

          <div className="player__top-right">
            <button
              type="button"
              className="player__icon-btn"
              aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
              aria-pressed={soundOn}
              disabled={discreet}
              onClick={() => setSoundOn(!session.soundOn)}
            >
              {soundOn ? <SoundOnIcon size={18} /> : <SoundOffIcon size={18} />}
            </button>
            <button
              type="button"
              className="player__icon-btn"
              aria-label="Swap this exercise"
              onClick={() => swapAt(index)}
            >
              <SwapIcon size={18} />
            </button>
          </div>
        </div>

        {discreet ? (
          <div className="player__badge-row">
            <span className="player__badge">SUBTLE ENOUGH FOR THE OFFICE</span>
          </div>
        ) : null}
      </div>

      <div
        className={`player__stage${showingSwitch ? ' player__under' : ''}`}
      >
        <div className="player__halo">
          <Mascot
            name={poseFor(current)}
            size={discreet ? 210 : 270}
            alt={`${COACH_LABEL[coach]} coach demonstrating ${current.name.toLowerCase()}`}
            className={discreet ? undefined : 'bob'}
          />
        </div>
      </div>

      <div className={showingSwitch ? 'player__under' : undefined}>
        <div className="player__caption">
          <h1 className="player__name">{current.name}</h1>
          <p className="player__cue" aria-live="polite">
            <CueLine exercise={current} remaining={remaining} />
          </p>
        </div>

        {discreet ? (
          <LinearTimer
            name={current.name}
            remaining={remaining}
            progress={progress}
          />
        ) : (
          <RingTimer remaining={remaining} progress={progress} />
        )}

        <div className="player__transport">
          <button
            type="button"
            className="player__side"
            onClick={() => advance(false)}
          >
            Skip
          </button>

          <button
            type="button"
            className="player__play"
            aria-label="Pause"
            onClick={() => setStage('paused')}
          >
            <PauseIcon size={30} />
          </button>

          <button
            type="button"
            className="player__side"
            onClick={() => advance(false)}
          >
            Next
          </button>
        </div>
      </div>

      {showingSwitch ? (
        <SwitchSides
          exercise={current}
          onDone={() => setStage('running')}
        />
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The coaching line rotates through the exercise's cues as time runs down, so
 * the copy tracks where the user actually is in the movement.
 */
function CueLine({
  exercise,
  remaining,
}: {
  exercise: Exercise;
  remaining: number;
}) {
  const elapsed = exercise.seconds - remaining;
  const step = exercise.seconds / exercise.cues.length;
  const position = Math.min(
    exercise.cues.length - 1,
    Math.floor(elapsed / step),
  );
  return <>{exercise.cues[position]}</>;
}
