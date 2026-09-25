import { Mascot, type MascotName } from './Mascot';
import { useCoach } from './coach';

interface ExerciseFigureProps {
  /** The drawn pose: shown when there is no clip, and under reduced motion. */
  pose: MascotName;
  /** The panda's looping demonstration, from `clipFor` / `clipForSet`. */
  clip?: string;
  size: number;
  alt?: string;
  className?: string;
  /** The idle bob, for the still only — a clip already moves. */
  bob?: boolean;
  /** Hold the drawn pose even when a clip exists, as the paused screen does. */
  still?: boolean;
}

/**
 * The coach demonstrating an exercise: its animated clip where one exists,
 * its drawn pose otherwise.
 *
 * Clips are panda-only, so any other coach gets the still — a screen must
 * never mix species. An animated WebP can't be paused from CSS, so under
 * reduced motion the stylesheet hides the clip and shows the still that is
 * rendered beside it.
 */
export function ExerciseFigure({
  pose,
  clip,
  size,
  alt = '',
  className,
  bob = false,
  still = false,
}: ExerciseFigureProps) {
  const coach = useCoach();
  const animated = Boolean(clip) && !still && coach === 'panda';
  const stillClass = [animated ? 'figure__still' : undefined, bob ? 'bob' : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={['figure', className].filter(Boolean).join(' ')}>
      {animated ? (
        <img
          src={clip}
          alt={alt}
          width={size}
          height={size}
          className="figure__clip"
          style={{ width: size, height: size, objectFit: 'contain' }}
        />
      ) : null}
      <Mascot
        name={pose}
        size={size}
        alt={animated ? '' : alt}
        className={stillClass || undefined}
      />
    </span>
  );
}
