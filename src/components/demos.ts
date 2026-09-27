import type { Coach } from './coach';
import type { MascotName } from './Mascot';

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
 *
 * This is where an exercise's clip goes. Give it a pose in `poses.ts`, import
 * its loop and first frame above, and add them here: the exercise screen
 * stands it in the grove's clearing, and until then shows the clearing empty.
 */
export const DEMOS: Partial<Record<Coach, Partial<Record<MascotName, Demo>>>> = {
  panda: {
    neckrolls: { playing: pandaNeckroll, still: pandaNeckrollStill },
  },
};

/**
 * Whether a pose has a demonstration clip for this coach, for a screen that
 * shows the movement or nothing at all rather than fall back to a still.
 */
export function hasDemo(coach: Coach, name: MascotName): boolean {
  return Boolean(DEMOS[coach]?.[name]);
}
