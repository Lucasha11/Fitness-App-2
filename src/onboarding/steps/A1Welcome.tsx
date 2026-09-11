import { COACH_LABEL, COACH_NOUN, nextCoach } from '../../components/coach';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, ScreenFooter, TextButton } from '../../components/ui';
import type { StepProps } from '../types';

export function A1Welcome({ state, set, next, go }: StepProps) {
  const coach = state.coach;
  const other = nextCoach(coach);

  return (
    <Screen tone="warm" className="a1" labelledBy="a1-title">
      <div className="a1__art">
        <button
          type="button"
          className="a1__swap"
          onClick={() => set({ coach: other })}
          aria-label={`Your coach is a ${COACH_NOUN[coach]}. Switch to the ${COACH_NOUN[other]}.`}
        >
          <span className="a1__swap-figure bob">
            <Mascot
              name="lifting"
              size={300}
              alt={`${COACH_LABEL[coach]} coach stretching at a desk`}
            />
          </span>
          <span className="a1__swap-hint" aria-hidden="true">
            Tap to meet the {COACH_NOUN[other]}
          </span>
        </button>
      </div>

      <h1 className="a1__title" id="a1-title">
        Your {COACH_NOUN[coach]}
        <br />
        hates chairs
      </h1>
      <p className="a1__sub">
        45-second movement breaks, at your desk, in your clothes. No gym, no
        guilt.
      </p>

      <div className="a1__gap" aria-hidden="true" />

      <ScreenFooter>
        <Button variant="inverse" onClick={next}>
          Get started
        </Button>
        <TextButton onWarm onClick={() => go('A17')}>
          I already have an account
        </TextButton>
      </ScreenFooter>
    </Screen>
  );
}
