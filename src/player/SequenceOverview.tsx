import { useRef, useState } from 'react';
import { ChevronLeftIcon, SwapIcon } from '../components/icons';
import { Mascot } from '../components/Mascot';
import { type Exercise, formatDuration } from '../exercises';
import { BODY_REGION_LABELS } from '../onboarding/state';
import { poseFor, tintFor } from './poses';

/** Row height plus the gap between rows, for mapping a drag to an index. */
const ROW_PITCH = 84;

interface SequenceOverviewProps {
  sequence: Exercise[];
  /** How long each exercise in this break runs. */
  exerciseSeconds: number;
  /** Index of the exercise currently playing, or about to. */
  currentIndex: number;
  onReorder: (from: number, to: number) => void;
  onSwap: (index: number) => void;
  onBack: () => void;
}

/**
 * C9 · the four exercises this break will run through. Rows drag to reorder
 * and each has its own swap control.
 */
export function SequenceOverview({
  sequence,
  exerciseSeconds,
  currentIndex,
  onReorder,
  onSwap,
  onBack,
}: SequenceOverviewProps) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const startY = useRef(0);

  const totalSeconds = sequence.length * exerciseSeconds;
  const allSubtle = sequence.every((item) => item.subtle);

  const onHandleDown = (index: number) => (event: React.PointerEvent) => {
    event.preventDefault();
    startY.current = event.clientY;
    setDragging(index);
    setOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onHandleMove = (event: React.PointerEvent) => {
    if (dragging === null) return;
    setOffset(event.clientY - startY.current);
  };

  const onHandleUp = () => {
    if (dragging === null) return;

    // Where the row ended up, in row-pitch units.
    const moved = Math.round(offset / ROW_PITCH);
    const target = Math.max(
      0,
      Math.min(sequence.length - 1, dragging + moved),
    );
    if (target !== dragging) onReorder(dragging, target);

    setDragging(null);
    setOffset(0);
  };

  return (
    <section className="overview" aria-label="This break">
      <div className="overview__head">
        <button
          type="button"
          className="overview__back"
          aria-label="Back"
          onClick={onBack}
        >
          <ChevronLeftIcon size={22} />
        </button>
        <h1 className="overview__title">This break</h1>
      </div>
      <p className="overview__hint">
        Drag to reorder · tap swap for a different move
      </p>

      <ul className="overview__list">
        {sequence.map((exercise, index) => {
          const isDragging = dragging === index;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={`${exercise.id}-${index}`}
              className={`seq-row${isCurrent ? ' seq-row--current' : ''}${
                isDragging ? ' seq-row--dragging' : ''
              }`}
              style={
                isDragging ? { transform: `translateY(${offset}px)` } : undefined
              }
            >
              <button
                type="button"
                className="seq-row__handle"
                aria-label={`Reorder ${exercise.name}`}
                onPointerDown={onHandleDown(index)}
                onPointerMove={onHandleMove}
                onPointerUp={onHandleUp}
                onPointerCancel={onHandleUp}
                onKeyDown={(event) => {
                  // Keyboard equivalent of the drag.
                  if (event.key === 'ArrowUp' && index > 0) {
                    event.preventDefault();
                    onReorder(index, index - 1);
                  }
                  if (event.key === 'ArrowDown' && index < sequence.length - 1) {
                    event.preventDefault();
                    onReorder(index, index + 1);
                  }
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 8h16" />
                  <path d="M4 16h16" />
                </svg>
              </button>

              <span
                className="seq-row__thumb"
                style={{ background: tintFor(exercise.region) }}
              >
                <Mascot name={poseFor(exercise)} size={42} />
              </span>

              <span className="seq-row__text">
                <span className="seq-row__name">{exercise.name}</span>
                <span className="seq-row__meta">
                  {isCurrent
                    ? `Playing now · ${formatDuration(exerciseSeconds)}`
                    : `${BODY_REGION_LABELS[exercise.region]} · ${formatDuration(
                        exerciseSeconds,
                      )}`}
                </span>
              </span>

              <button
                type="button"
                className="seq-row__swap"
                aria-label={`Swap ${exercise.name}`}
                onClick={() => onSwap(index)}
              >
                <SwapIcon size={18} />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="overview__total">
        {formatDuration(totalSeconds)} total ·{' '}
        {allSubtle ? 'all seated, all silent' : 'includes standing moves'}
      </p>
    </section>
  );
}
