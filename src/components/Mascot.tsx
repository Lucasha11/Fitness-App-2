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
/*
 * The keyframes panda, cut from panda-keyframes-poses.png: the look the home
 * screen mockup is drawn in. Lossy WebP with alpha, at a tenth of the PNGs'
 * weight.
 */
import pandaStand from '../assets/panda-stand.webp';
import pandaWave from '../assets/panda-wave.webp';
import pandaArmsout from '../assets/panda-armsout.webp';
import pandaHips from '../assets/panda-hips.webp';
import pandaSit from '../assets/panda-sit.webp';
import pandaStride from '../assets/panda-stride.webp';
import pandaJog from '../assets/panda-jog.webp';
import pandaCrouch from '../assets/panda-crouch.webp';
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
  | 'water'
  // The keyframes panda's poses.
  | 'stand'
  | 'wave'
  | 'armsout'
  | 'hips'
  | 'sit'
  | 'stride'
  | 'jog'
  | 'crouch';

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
    stand: pandaStand,
    wave: pandaWave,
    armsout: pandaArmsout,
    hips: pandaHips,
    sit: pandaSit,
    stride: pandaStride,
    jog: pandaJog,
    crouch: pandaCrouch,
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
    // The squirrel is retired and was never drawn in these poses. A retired
    // coach can't reach a screen (see COACHES), so these borrow the panda's
    // art rather than a blank; draw them before the squirrel returns.
    stand: pandaStand,
    wave: pandaWave,
    armsout: pandaArmsout,
    hips: pandaHips,
    sit: pandaSit,
    stride: pandaStride,
    jog: pandaJog,
    crouch: pandaCrouch,
  },
};

interface MascotProps {
  name: MascotName;
  size: number;
  /** Empty string marks the mascot as decorative, matching the canvas. */
  alt?: string;
  className?: string;
  /**
   * Overrides the screen's coach. Only the picker has any business setting
   * this: it is the one screen whose job is showing the species side by side,
   * so it is the documented exception to "never mix species on one screen".
   * Everywhere else, leave it alone and let the context decide.
   */
  coach?: Coach;
}

/** The MoveMate coach, in whichever species the surrounding screen picked. */
export function Mascot({
  name,
  size,
  alt = '',
  className,
  coach: override,
}: MascotProps) {
  const contextCoach = useCoach();
  const coach = override ?? contextCoach;

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
