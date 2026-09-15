import { COACH_LABEL, COACH_NOUN } from '../../components/coach';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, ScreenFooter, TextButton } from '../../components/ui';
import type { StepProps } from '../types';

export function A1Welcome({ state, next, go }: StepProps) {
  const coach = state.coach;

  return (
    <Screen tone="warm" className="a1" labelledBy="a1-title">
      <div className="a1__art bob">
        <Mascot
          name="lifting"
          size={300}
          alt={`${COACH_LABEL[coach]} coach stretching at a desk`}
        />
      </div>

      <h1 className="a1__title" id="a1-title">
        Your {COACH_NOUN[coach]}
        <br />
        hates chairs
      </h1>
      <p className="a1__sub">
        One-minute movement breaks, at your desk, in your clothes. No gym, no
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
