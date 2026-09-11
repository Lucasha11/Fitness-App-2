import lifting from '../assets/panda-lifting.png';
import pullups from '../assets/panda-pullups.png';
import squats from '../assets/panda-squats.png';
import thumbsup from '../assets/panda-thumbsup.png';
import walking from '../assets/panda-walking.png';
import water from '../assets/panda-water.png';

export type MascotName =
  | 'lifting'
  | 'pullups'
  | 'squats'
  | 'thumbsup'
  | 'walking'
  | 'water';

/** Bundled so the hashed, cache-busted URL is resolved at build time. */
const SOURCES: Record<MascotName, string> = {
  lifting,
  pullups,
  squats,
  thumbsup,
  walking,
  water,
};

interface MascotProps {
  name: MascotName;
  size: number;
  /** Empty string marks the mascot as decorative, matching the canvas. */
  alt?: string;
  className?: string;
}

/** The MoveMate panda, as shipped with the design. */
export function Mascot({ name, size, alt = '', className }: MascotProps) {
  return (
    <img
      src={SOURCES[name]}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
