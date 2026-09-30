import { CheckIcon, ClockIcon } from '../../components/icons';
import { Button, Screen, ScreenBody, ScreenFooter, Spacer } from '../../components/ui';
import { CoachSays, StepHeader } from '../chrome';
import { SITTING_LINES } from '../reactions';
import { SITTING_BAND_ORDER, SITTING_BANDS } from '../state';
import type { StepProps } from '../types';

export function SittingHours({ state, set, next, back }: StepProps) {
  const chosen = state.sittingBand;

  return (
    <Screen labelledBy="sitting-title">
      <StepHeader step="sitting" onBack={back} />

      <ScreenBody>
        <h1 className="title" id="sitting-title">
          How long did you sit yesterday?
        </h1>
        <p className="subtitle">A rough guess. The commute and the sofa count.</p>

        <div className="option-grid">
          {SITTING_BAND_ORDER.map((band) => {
            const selected = chosen === band;
            return (
              <button
                key={band}
                type="button"
                className="option hours-option"
                aria-pressed={selected}
                aria-label={`${SITTING_BANDS[band].label} hours, ${SITTING_BANDS[band].tag}`}
                onClick={() => set({ sittingBand: band })}
              >
                <span className="option__head">
                  <ClockIcon />
                  {selected ? <CheckIcon size={20} /> : null}
                </span>
                <span className="hours-option__value">
                  {SITTING_BANDS[band].label}
                  <small> h</small>
                </span>
                <span className="hours-option__tag">{SITTING_BANDS[band].tag}</span>
              </button>
            );
          })}
        </div>

        <Spacer />
        <CoachSays>{SITTING_LINES[chosen ?? 'none']}</CoachSays>
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next} disabled={chosen === null}>
          See my score
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
