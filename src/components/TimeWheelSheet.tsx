import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';
import './time-wheel.css';
import {
  type ClockParts,
  minutesFromParts,
  timeParts,
} from '../onboarding/state';

/**
 * Must match `--wheel-item-height` in time-wheel.css: the scroll position is
 * read back as `scrollTop / ITEM_HEIGHT`, so the two cannot drift.
 */
const ITEM_HEIGHT = 40;

/** 12 leads, the way a clock face and every native picker order the hours. */
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTE_STEP = 5;
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);
const MERIDIEMS: ClockParts['meridiem'][] = ['AM', 'PM'];

function smoothly(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}

interface WheelProps {
  label: string;
  items: string[];
  index: number;
  onPick: (index: number) => void;
}

/**
 * One scroll-snapping column. CSS does the snapping; this only reads back
 * where the browser settled and reports it upward.
 */
function Wheel({ label, items, index, onPick }: WheelProps) {
  const listId = useId();
  const ref = useRef<HTMLDivElement>(null);
  /**
   * The index we last told the parent about. Comparing against it is what
   * keeps a scroll from echoing: a re-render carrying our own value is a
   * no-op, while one carrying someone else's scrolls to meet it.
   */
  const reported = useRef(index);
  const idle = useRef<number | undefined>(undefined);

  // Open on the current value, with no animation to watch.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = reported.current * ITEM_HEIGHT;
  }, []);

  // A change from outside this column — the 30-minute floor pushing the other
  // end of the window — animates across.
  useEffect(() => {
    const el = ref.current;
    if (!el || index === reported.current) return;
    reported.current = index;
    el.scrollTo({ top: index * ITEM_HEIGHT, behavior: smoothly() });
  }, [index]);

  useEffect(() => () => window.clearTimeout(idle.current), []);

  const select = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, next));
      if (clamped === reported.current) return;
      reported.current = clamped;
      onPick(clamped);
      ref.current?.scrollTo({
        top: clamped * ITEM_HEIGHT,
        behavior: smoothly(),
      });
    },
    [items.length, onPick],
  );

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => {
      const landed = Math.max(
        0,
        Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_HEIGHT)),
      );
      if (landed === reported.current) return;
      reported.current = landed;
      onPick(landed);
    }, 90);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowDown' || event.key === 'PageDown'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'PageUp'
          ? -1
          : 0;

    if (step !== 0) {
      event.preventDefault();
      select(index + step);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      select(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      select(items.length - 1);
    }
  };

  return (
    <div
      ref={ref}
      className="wheel"
      role="listbox"
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={`${listId}-${index}`}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
    >
      <div className="wheel__pad" aria-hidden="true" />
      {items.map((item, itemIndex) => (
        <button
          key={item}
          id={`${listId}-${itemIndex}`}
          type="button"
          // A single tab stop on the list, the way a listbox is meant to work;
          // the options stay clickable for everyone using a finger.
          tabIndex={-1}
          role="option"
          aria-selected={itemIndex === index}
          className="wheel__item"
          onClick={() => select(itemIndex)}
        >
          {item}
        </button>
      ))}
      <div className="wheel__pad" aria-hidden="true" />
    </div>
  );
}

/**
 * The time picker MoveMate draws itself: three snapping wheels in a sheet,
 * in the app's own type and colour rather than the system's.
 */
export function TimeWheelSheet({
  title,
  minutes,
  onChange,
  onClose,
}: {
  title: string;
  minutes: number;
  onChange: (minutes: number) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const parts = timeParts(minutes);

  // Focus the panel itself so Escape works before anything is tabbed to.
  useEffect(() => {
    panel.current?.focus();
  }, []);

  const patch = (change: Partial<ClockParts>) =>
    onChange(minutesFromParts({ ...parts, ...change }));

  return (
    <div className="time-sheet">
      <button
        type="button"
        className="time-sheet__scrim"
        aria-label="Close without changing the time"
        onClick={onClose}
      />

      <div
        ref={panel}
        className="time-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose();
        }}
      >
        <div className="time-sheet__grabber" aria-hidden="true" />
        <p className="time-sheet__title">{title}</p>

        <div className="wheels">
          <div className="wheels__band" aria-hidden="true" />
          <Wheel
            label="Hour"
            items={HOURS.map(String)}
            index={HOURS.indexOf(parts.hour12)}
            onPick={(i) => patch({ hour12: HOURS[i] })}
          />
          <Wheel
            label="Minute"
            items={MINUTES.map((m) => String(m).padStart(2, '0'))}
            // Every minute the wheels can produce is already on the grid, so
            // rounding only matters for a value seeded from somewhere else.
            index={Math.round(parts.minute / MINUTE_STEP) % MINUTES.length}
            onPick={(i) => patch({ minute: MINUTES[i] })}
          />
          <Wheel
            label="AM or PM"
            items={MERIDIEMS}
            index={MERIDIEMS.indexOf(parts.meridiem)}
            onPick={(i) => patch({ meridiem: MERIDIEMS[i] })}
          />
        </div>

        <button type="button" className="time-sheet__done" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
