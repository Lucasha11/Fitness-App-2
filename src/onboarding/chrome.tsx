import type { ReactNode } from 'react';
import { ChairIcon, CheckIcon, ChevronLeftIcon, PersonIcon } from '../components/icons';
import { Mascot, type MascotName } from '../components/Mascot';
import { CHAPTERS, chapterIndex, questionNumber, type StepId } from './types';

/*
 * The furniture every onboarding screen shares: the trail across the top,
 * the coach's reaction above the button, and the score the flow plays for.
 */

/**
 * The trail: one stop per chapter, so what is left reads as places rather
 * than a percentage. Numbered questions add a counter underneath, which keeps
 * the long "Your plan" chapter feeling short.
 */
export function StepHeader({ step, onBack }: { step: StepId; onBack: () => void }) {
  const stage = chapterIndex(step) ?? 0;
  const question = questionNumber(step);

  return (
    <div className="step-header">
      <div className="trail-row">
        <button type="button" className="trail-back" aria-label="Back" onClick={onBack}>
          <ChevronLeftIcon size={20} />
        </button>
        <ol className="trail" aria-label={`Setup: ${CHAPTERS[stage].label}, stop ${stage + 1} of ${CHAPTERS.length}`}>
          {CHAPTERS.map((chapter, index) => (
            <li
              key={chapter.id}
              className="trail__stop"
              data-state={index < stage ? 'done' : index === stage ? 'current' : 'ahead'}
            >
              <span className="trail__node" aria-hidden="true">
                {index < stage ? <CheckIcon size={11} /> : null}
              </span>
            </li>
          ))}
        </ol>
        <span className="trail__label" aria-hidden="true">
          {CHAPTERS[stage].label}
        </span>
      </div>

      {question ? (
        <div className="qcount">
          <span>
            Question {question.n} of {question.of}
          </span>
          <span className="qcount__pips" aria-hidden="true">
            {Array.from({ length: question.of }, (_, index) => (
              <span key={index} data-done={index < question.n} />
            ))}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/*
 * The avatar is a head-and-shoulders crop of a full pose. The keyframe poses
 * all stand on the same baseline of their canvas, but the seated one starts
 * lower, so it needs a deeper lift to put its face in the circle.
 */
const AVATAR_SIZE = 110;
const AVATAR_LIFT: Partial<Record<MascotName, number>> = { sit: -15 };
const DEFAULT_LIFT = -9;

/** The coach answering the last tap. Announced, so it isn't sight-only. */
export function CoachSays({
  pose = 'stand',
  children,
}: {
  pose?: MascotName;
  children: ReactNode;
}) {
  return (
    <div className="says">
      <span className="says__face" aria-hidden="true">
        <span style={{ top: AVATAR_LIFT[pose] ?? DEFAULT_LIFT }}>
          <Mascot name={pose} size={AVATAR_SIZE} />
        </span>
      </span>
      <p className="says__bubble" aria-live="polite">
        {children}
      </p>
    </div>
  );
}

/**
 * You vs. The Chair, the contest Insights keeps once the app is in use. The
 * side ahead is lit; a tie lights neither.
 */
export function ScorePill({
  you,
  chair,
  onWarm = false,
}: {
  you: number;
  chair: number;
  onWarm?: boolean;
}) {
  return (
    <div
      className={`score-pill${onWarm ? ' score-pill--warm' : ''}`}
      role="img"
      aria-label={`Score: you ${you}, the chair ${chair}`}
    >
      <span className="score-pill__side" data-leading={you > chair}>
        <PersonIcon size={15} />
        You <b>{you}</b>
      </span>
      <span className="score-pill__vs">vs</span>
      <span className="score-pill__side" data-leading={chair > you}>
        <b>{chair}</b> Chair
        <ChairIcon size={15} />
      </span>
    </div>
  );
}

/*
 * Hand-placed rather than random, so the screen reads the same every time
 * and nothing lands on the headline: [left %, top %, turn, tone].
 */
const CONFETTI: [number, number, number, string][] = [
  [8, 9, 20, 'lime'],
  [22, 5, -30, 'mint'],
  [38, 12, 45, 'surface'],
  [61, 6, -10, 'lime'],
  [78, 11, 30, 'violet'],
  [91, 7, -40, 'mint'],
  [5, 24, 60, 'violet'],
  [93, 22, 15, 'surface'],
  [13, 38, -25, 'mint'],
  [86, 35, 50, 'lime'],
  [6, 72, 10, 'surface'],
  [95, 48, -55, 'violet'],
  [17, 16, 80, 'surface'],
  [70, 18, -70, 'mint'],
  [49, 3, 35, 'violet'],
  [30, 27, -15, 'lime'],
];

export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {CONFETTI.map(([left, top, turn, tone], index) => (
        <span
          key={index}
          className={`confetti__bit confetti__bit--${tone}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            transform: `rotate(${turn}deg)`,
            animationDelay: `${index * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}
