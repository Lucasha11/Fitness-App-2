import { COACH_LABEL } from '../../components/coach';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, ScreenFooter, TextButton } from '../../components/ui';
import { Confetti, ScorePill } from '../chrome';
import type { StepProps } from '../types';

/**
 * Past the paywall. Unlocking the plan is the user's first point back from
 * the chair, and their first break is the one that puts them ahead.
 */
export function Welcome({ state, finish }: StepProps) {
  return (
    <Screen tone="warm" className="welcome" labelledBy="welcome-title">
      <Confetti />

      <div className="welcome__body">
        <div className="bob">
          <Mascot name="wave" size={210} alt={`${COACH_LABEL[state.coach]} coach waving`} />
        </div>
        <span className="welcome__eyebrow">Plan unlocked</span>
        <h1 className="hook__title welcome__title" id="welcome-title">
          First point to you
        </h1>
        <p className="hook__sub">
          Your first break is ready whenever you are. Starting it takes the lead.
        </p>
        <ScorePill you={1} chair={1} onWarm />
        <span className="welcome__note">All square. Your move.</span>
      </div>

      <ScreenFooter>
        <Button variant="inverse" onClick={() => finish({ startBreak: true })}>
          Start my first break
        </Button>
        <TextButton onWarm onClick={() => finish({ startBreak: false })}>
          Take me to the app
        </TextButton>
      </ScreenFooter>
    </Screen>
  );
}
