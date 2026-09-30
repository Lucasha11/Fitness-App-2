import { COACH_LABEL } from '../../components/coach';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, ScreenFooter, TextButton } from '../../components/ui';
import type { StepProps } from '../types';

/** Named before anything is offered, so the user recognises their own day. */
const ACHES = ['Stiff neck', 'Shoulders up by your ears', 'Achy lower back', '3pm slump'];

export function Hook({ state, next, go }: StepProps) {
  return (
    <Screen tone="warm" className="hook" labelledBy="hook-title">
      <div className="hook__art bob">
        <Mascot
          name="hips"
          size={290}
          alt={`${COACH_LABEL[state.coach]} coach, hands on hips, unimpressed`}
        />
      </div>

      <ul className="hook__aches" aria-label="Sound familiar?">
        {ACHES.map((ache) => (
          <li key={ache} className="hook__ache">
            {ache}
          </li>
        ))}
      </ul>

      <h1 className="hook__title" id="hook-title">
        Your body
        <br />
        aches by 3pm
      </h1>
      <p className="hook__sub">
        Not because you&rsquo;re unfit. Because you&rsquo;ve been sitting since
        nine.
      </p>

      <div className="hook__gap" aria-hidden="true" />

      <ScreenFooter>
        <Button variant="inverse" onClick={next}>
          That&rsquo;s me
        </Button>
        <TextButton onWarm onClick={() => go('signIn')}>
          I already have an account
        </TextButton>
      </ScreenFooter>
    </Screen>
  );
}
