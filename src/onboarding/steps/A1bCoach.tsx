import { useCallback, useEffect, useRef } from 'react';
import { CheckIcon } from '../../components/icons';
import { COACH_PROFILES, type Coach } from '../../components/coach';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, ScreenFooter } from '../../components/ui';
import type { StepProps } from '../types';

/**
 * Card width and gap, mirrored from `.coach-card` / `.coach-track` in
 * onboarding.css. The scroll position has to be read in the same units the
 * layout is drawn in, so the two are kept together deliberately.
 */
const CARD_WIDTH = 262;
const CARD_GAP = 14;
const STEP = CARD_WIDTH + CARD_GAP;

/**
 * Past this many coaches, dots stop being countable — the pager becomes an
 * "n of m" readout plus a rail of thumbnails, so reaching the last coach is
 * one tap rather than a row of swipes.
 */
const MAX_DOTS = 4;

/**
 * How long the track has to hold still before its position counts as a
 * choice. Scroll events also fire *during* a programmatic smooth scroll, and
 * acting on those mid-flight positions would let a tap on a peeking card
 * re-select whatever it was passing over.
 */
const SETTLE_MS = 120;

/** Long enough for a one-card smooth scroll to have finished. */
const SCROLL_MS = 420;

/**
 * A1b · picking the coach.
 *
 * A swipeable carousel rather than a grid, because the roster is meant to
 * grow: one card is the unit, and everything around it (pager, rail, copy)
 * derives from COACH_PROFILES.length.
 */
export function A1bCoach({ state, set, next }: StepProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | undefined>(undefined);
  const index = Math.max(
    0,
    COACH_PROFILES.findIndex((profile) => profile.value === state.coach),
  );
  const current = COACH_PROFILES[index];
  const manyCoaches = COACH_PROFILES.length > MAX_DOTS;

  // Read inside the settle callback, which outlives the render that made it.
  const coachRef = useRef(state.coach);
  useEffect(() => {
    coachRef.current = state.coach;
  }, [state.coach]);

  /**
   * Centring follows the selection rather than driving it, and runs after the
   * commit: a `scrollTo` fired from the click handler is cancelled by the
   * re-render that same tap causes, which snapped the track straight back.
   *
   * A swipe lands the track where it already wants to be, so the guard makes
   * this a no-op there and only the taps animate.
   */
  const firstRun = useRef(true);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const left = index * STEP;
    const from = track.scrollLeft;
    const wasFirstRun = firstRun.current;
    firstRun.current = false;
    if (Math.abs(from - left) <= 1) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const smooth = !wasFirstRun && !reduced;
    track.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    if (!smooth) return;

    /*
     * Not every engine honours smooth scrolling — some embedded WebViews drop
     * the request entirely rather than jumping. Land the card anyway once the
     * animation would have finished, unless the position moved in the
     * meantime, which means either the scroll ran or the user took over.
     */
    const land = window.setTimeout(() => {
      if (track.scrollLeft === from) track.scrollLeft = left;
    }, SCROLL_MS);
    return () => window.clearTimeout(land);
  }, [index]);

  const select = useCallback(
    (coach: Coach) => {
      set({ coach });
    },
    [set],
  );

  /**
   * Swiping is the selection: whichever card the track comes to rest on
   * becomes the coach. Reading it off scrollLeft keeps the native momentum
   * and snapping rather than reimplementing them.
   */
  const onScroll = useCallback(() => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      const settled = Math.round(track.scrollLeft / STEP);
      // Still travelling: a smooth scroll can pause between frames, and acting
      // on a position that is not a snap point would pick the card it happens
      // to be passing over.
      if (Math.abs(track.scrollLeft - settled * STEP) > 2) return;
      const profile = COACH_PROFILES[settled];
      if (profile && profile.value !== coachRef.current) select(profile.value);
    }, SETTLE_MS);
  }, [select]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const jumpTo = useCallback(
    (target: number) => {
      select(COACH_PROFILES[target].value);
    },
    [select],
  );

  return (
    <Screen className="coach-screen" labelledBy="a1b-title">
      <h1 className="title" id="a1b-title">
        Who&rsquo;s coaching you?
      </h1>
      <p className="subtitle">Swipe to meet them.</p>

      <div
        className="coach-track"
        ref={trackRef}
        onScroll={onScroll}
        role="group"
        aria-label="Coaches"
      >
        {COACH_PROFILES.map((profile, position) => {
          const selected = profile.value === state.coach;
          return (
            <button
              key={profile.value}
              type="button"
              className="coach-card"
              aria-pressed={selected}
              onClick={() => jumpTo(position)}
            >
              {selected ? (
                <span className="coach-card__check" aria-hidden="true">
                  <CheckIcon size={16} strokeWidth={3.5} />
                </span>
              ) : null}

              <span className="coach-card__halo">
                <Mascot name={profile.pose} size={152} coach={profile.value} />
              </span>

              <span className="coach-card__name">{profile.name}</span>
              <span className="coach-card__blurb">{profile.blurb}</span>

              <span className="coach-card__traits">
                {profile.traits.map((trait) => (
                  <span key={trait} className="coach-card__trait">
                    {trait}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {manyCoaches ? (
        <>
          <p className="coach-count" aria-live="polite">
            {index + 1} of {COACH_PROFILES.length}
          </p>
          <div className="coach-rail" role="group" aria-label="Jump to a coach">
            {COACH_PROFILES.map((profile, position) => (
              <button
                key={profile.value}
                type="button"
                className="coach-rail__item"
                aria-pressed={profile.value === state.coach}
                aria-label={profile.name}
                onClick={() => jumpTo(position)}
              >
                <Mascot name={profile.pose} size={36} coach={profile.value} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="dots coach-dots" role="tablist" aria-label="Coaches">
          {COACH_PROFILES.map((profile, position) => (
            <button
              key={profile.value}
              type="button"
              role="tab"
              className="dots__dot"
              aria-current={position === index}
              aria-label={profile.name}
              onClick={() => jumpTo(position)}
            />
          ))}
        </div>
      )}

      <div className="screen__spacer" />

      <ScreenFooter>
        <p className="coach-note">You can swap coaches any time.</p>
        <Button onClick={next}>Continue with the {current.name.toLowerCase()}</Button>
      </ScreenFooter>
    </Screen>
  );
}
