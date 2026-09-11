import nineNinety from '../assets/panda-9090.png';
import figurefour from '../assets/panda-figurefour.png';
import lifting from '../assets/panda-lifting.png';
import marching from '../assets/panda-marching.png';
import neckrolls from '../assets/panda-neckrolls.png';
import pullups from '../assets/panda-pullups.png';
import spinaltwist from '../assets/panda-spinaltwist.png';
import squats from '../assets/panda-squats.png';
import thumbsup from '../assets/panda-thumbsup.png';
import walking from '../assets/panda-walking.png';
import water from '../assets/panda-water.png';

export type MascotName =
  | '9090'
  | 'figurefour'
  | 'lifting'
  | 'marching'
  | 'neckrolls'
  | 'pullups'
  | 'spinaltwist'
  | 'squats'
  | 'thumbsup'
  | 'walking'
  | 'water';

/** Bundled so the hashed, cache-busted URL is resolved at build time. */
const SOURCES: Record<MascotName, string> = {
  '9090': nineNinety,
  figurefour,
  lifting,
  marching,
  neckrolls,
  pullups,
  spinaltwist,
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
