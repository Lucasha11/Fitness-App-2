import pandaLifting from '../assets/panda-lifting.png';
import pandaPullups from '../assets/panda-pullups.png';
import pandaWalking from '../assets/panda-walking.png';
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
/*
 * The neck rolls demonstration: panda-stand.webp driven through a filmed neck
 * roll by motion transfer, keyed off green and looped as an animated WebP
 * (216 frames, 28 ms each, about six seconds). Animated WebP rather than video
 * because it keeps its alpha in WKWebView, Safari and Chrome from one file;
 * a transparent video needs HEVC for Apple and VP9 for Chrome, and Chrome on
 * a Mac will take the HEVC and paint it on black. The still is the loop's
 * first frame, so pausing and resuming never jump between two drawings.
 */
import pandaNeckroll from '../assets/panda-neckroll.webp';
import pandaNeckrollStill from '../assets/panda-neckroll-still.webp';
import squirrelLifting from '../assets/squirrel-lifting.png';
import squirrelNeckrolls from '../assets/squirrel-neckrolls.png';
import squirrelPullups from '../assets/squirrel-pullups.png';
import squirrelWalking from '../assets/squirrel-walking.png';
import { useState } from 'react';
import { useCoach, type Coach } from './coach';

export type MascotName =
  | 'lifting'
  | 'neckrolls'
  | 'pullups'
  | 'walking'
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
    lifting: pandaLifting,
    // The demo was driven from panda-stand.webp and its first frame lands on
    // the same pixels, so the tile and the demo read as one drawing.
    neckrolls: pandaStand,
    pullups: pandaPullups,
    walking: pandaWalking,
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
    lifting: squirrelLifting,
    neckrolls: squirrelNeckrolls,
    pullups: squirrelPullups,
    walking: squirrelWalking,
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

interface Demo {
  /** The looping animation, on the same square canvas as the stills. */
  playing: string;
  /** Its first frame, held while paused or when motion is reduced. */
  still: string;
}

/**
 * Poses that can demonstrate their movement rather than just show it. Only
 * the panda has any: the squirrel is retired, and a coach without a demo
 * falls back to its still.
 */
const DEMOS: Partial<Record<Coach, Partial<Record<MascotName, Demo>>>> = {
  panda: {
    neckrolls: { playing: pandaNeckroll, still: pandaNeckrollStill },
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
  /**
   * Plays the pose's demonstration where one exists. `paused` holds it at
   * its first frame, for a screen that stands in for a paused exercise.
   */
  demo?: 'playing' | 'paused';
}

/** The MoveMate coach, in whichever species the surrounding screen picked. */
export function Mascot({
  name,
  size,
  alt = '',
  className,
  coach: override,
  demo,
}: MascotProps) {
  const contextCoach = useCoach();
  const coach = override ?? contextCoach;
  /*
   * An animated WebP ignores CSS animation rules, so the global
   * reduced-motion override can't stop it; hold the still instead.
   */
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const clip = demo ? DEMOS[coach]?.[name] : undefined;
  const src = clip
    ? demo === 'playing' && !reducedMotion
      ? clip.playing
      : clip.still
    : SOURCES[coach][name];

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
