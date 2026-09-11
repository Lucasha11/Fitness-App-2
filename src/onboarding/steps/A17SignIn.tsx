import { ChevronLeftIcon } from '../../components/icons';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, TextButton } from '../../components/ui';
import type { StepProps } from '../types';

/**
 * Optional account screen, reachable from A1. Signing in only changes where
 * the data lives, so every route out of here returns to the flow.
 */
export function A17SignIn({ set, back }: StepProps) {
  const choose = (account: 'apple' | 'email' | 'local') => {
    set({ account });
    back();
  };

  return (
    <Screen labelledBy="a17-title">
      <button
        type="button"
        className="icon-btn"
        aria-label="Back"
        onClick={back}
      >
        <ChevronLeftIcon size={24} />
      </button>

      <h1 className="title title--lg" style={{ marginTop: 24 }} id="a17-title">
        Only if you want to
      </h1>
      <p className="subtitle subtitle--lg">
        MoveMate works fully without an account. Sign in only to sync and back
        up your streak.
      </p>

      <div className="art-fill bob">
        <Mascot name="water" size={200} />
      </div>

      <div className="auth">
        <Button variant="dark" onClick={() => choose('apple')}>
          Continue with Apple
        </Button>
        <Button variant="outline" onClick={() => choose('email')}>
          Continue with email
        </Button>
        <TextButton tight onClick={() => choose('local')}>
          Keep everything on this phone
        </TextButton>
      </div>
    </Screen>
  );
}
