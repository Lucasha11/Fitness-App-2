import pandaNineNinety from '../assets/panda-9090.png';
import pandaFigurefour from '../assets/panda-figurefour.png';
import pandaLifting from '../assets/panda-lifting.png';
import pandaMarching from '../assets/panda-marching.png';
import pandaNeckrolls from '../assets/panda-neckrolls.png';
import pandaPullups from '../assets/panda-pullups.png';
import pandaSpinaltwist from '../assets/panda-spinaltwist.png';
import pandaSquats from '../assets/panda-squats.png';
import pandaThumbsup from '../assets/panda-thumbsup.png';
import pandaWalking from '../assets/panda-walking.png';
import pandaWater from '../assets/panda-water.png';
import squirrelNineNinety from '../assets/squirrel-9090.png';
import squirrelFigurefour from '../assets/squirrel-figurefour.png';
import squirrelLifting from '../assets/squirrel-lifting.png';
import squirrelMarching from '../assets/squirrel-marching.png';
import squirrelNeckrolls from '../assets/squirrel-neckrolls.png';
import squirrelPullups from '../assets/squirrel-pullups.png';
import squirrelSpinaltwist from '../assets/squirrel-spinaltwist.png';
import squirrelSquats from '../assets/squirrel-squats.png';
import squirrelThumbsup from '../assets/squirrel-thumbsup.png';
import squirrelWalking from '../assets/squirrel-walking.png';
import squirrelWater from '../assets/squirrel-water.png';
import { useCoach, type Coach } from './coach';

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

/**
 * Bundled so the hashed, cache-busted URL is resolved at build time. Both
 * species carry every pose, and TypeScript holds them to that: a new pose is
 * only usable once it is drawn for each coach.
 */
const SOURCES: Record<Coach, Record<MascotName, string>> = {
  panda: {
    '9090': pandaNineNinety,
    figurefour: pandaFigurefour,
    lifting: pandaLifting,
    marching: pandaMarching,
    neckrolls: pandaNeckrolls,
    pullups: pandaPullups,
    spinaltwist: pandaSpinaltwist,
    squats: pandaSquats,
    thumbsup: pandaThumbsup,
    walking: pandaWalking,
    water: pandaWater,
  },
  squirrel: {
    '9090': squirrelNineNinety,
    figurefour: squirrelFigurefour,
    lifting: squirrelLifting,
    marching: squirrelMarching,
    neckrolls: squirrelNeckrolls,
    pullups: squirrelPullups,
    spinaltwist: squirrelSpinaltwist,
    squats: squirrelSquats,
    thumbsup: squirrelThumbsup,
    walking: squirrelWalking,
    water: squirrelWater,
  },
};

interface MascotProps {
  name: MascotName;
  size: number;
  /** Empty string marks the mascot as decorative, matching the canvas. */
  alt?: string;
  className?: string;
}

/** The MoveMate coach, in whichever species the surrounding screen picked. */
export function Mascot({ name, size, alt = '', className }: MascotProps) {
  const coach = useCoach();

  return (
    <img
      src={SOURCES[coach][name]}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
