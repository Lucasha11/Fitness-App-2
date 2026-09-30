import { ChairIcon, PersonIcon, TrophyIcon } from '../../components/icons';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, ScreenBody, ScreenFooter } from '../../components/ui';
import { StepHeader } from '../chrome';
import { chairDaysPerYear, chairHoursPerYear } from '../state';
import type { StepProps } from '../types';

/**
 * Round one of You vs. The Chair. The chair's score is the user's own answer
 * scaled to a working year, so the number is theirs rather than a statistic.
 */
export function Scoreboard({ state, next, back }: StepProps) {
  // The previous screen can't be left without an answer; the fallback only
  // covers a sheet restored mid-flow from an older version.
  const band = state.sittingBand ?? '6to8';
  const hours = chairHoursPerYear(band);

  return (
    <Screen labelledBy="scoreboard-title">
      <StepHeader step="scoreboard" onBack={back} />

      <ScreenBody>
        <span className="eyebrow versus__eyebrow">Round one</span>

        <div
          className="card card--strong versus"
          role="img"
          aria-label={`You: 0 breaks. The chair: ${hours.toLocaleString('en-GB')} hours a year, and leading.`}
        >
          <div className="versus__side">
            <span className="versus__icon versus__icon--you">
              <PersonIcon size={24} />
            </span>
            <span className="versus__name">You</span>
            <span className="versus__value">0</span>
            <span className="versus__unit">breaks</span>
          </div>

          <span className="versus__vs">VS</span>

          <div className="versus__side">
            <span className="versus__lead">
              <TrophyIcon size={13} /> Leading
            </span>
            <span className="versus__icon versus__icon--chair">
              <ChairIcon size={24} />
            </span>
            <span className="versus__name">The Chair</span>
            <span className="versus__value">{hours.toLocaleString('en-GB')}</span>
            <span className="versus__unit">hours a year</span>
          </div>
        </div>

        <h1 className="title title--center" id="scoreboard-title">
          That&rsquo;s {chairDaysPerYear(band)} whole days a year in a chair.
        </h1>
        <p className="subtitle subtitle--lg title--center">
          Round one goes to the chair. Let&rsquo;s even the score, one minute at
          a time.
        </p>

        <div className="art-fill bob">
          <Mascot name="crouch" size={200} />
        </div>
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next}>Even the score</Button>
      </ScreenFooter>
    </Screen>
  );
}
