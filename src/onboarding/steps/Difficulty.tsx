import { Button, Screen, ScreenBody, ScreenFooter, Spacer } from '../../components/ui';
import { CoachSays, StepHeader } from '../chrome';
import { TIER_LINES } from '../reactions';
import { GOAL_TIERS, movementMinutes, tierForGoal } from '../state';
import type { StepProps } from '../types';

/** The pips run to the hardest tier, so every row is drawn on one scale. */
const PIPS = Math.max(...GOAL_TIERS.map((tier) => tier.goal));

/**
 * The daily goal as a difficulty pick. Each tier writes a plain `dailyGoal`,
 * so Today, Insights and the milestones read it exactly as before.
 */
export function Difficulty({ state, set, next, back }: StepProps) {
  const chosen = tierForGoal(state.dailyGoal);

  return (
    <Screen labelledBy="difficulty-title">
      <StepHeader step="difficulty" onBack={back} />

      <ScreenBody>
        <h1 className="title title--step" id="difficulty-title">
          Pick your difficulty
        </h1>
        <p className="subtitle">How many breaks a day count as a win?</p>

        <div className="option-list">
          {GOAL_TIERS.map((tier) => {
            const selected = chosen === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                className="option-row tier"
                aria-pressed={selected}
                onClick={() => set({ dailyGoal: tier.goal })}
              >
                <span className="tier__pips" aria-hidden="true">
                  {Array.from({ length: PIPS }, (_, index) => (
                    <span key={index} data-on={index < tier.goal} />
                  ))}
                </span>
                <span className="option-row__text">
                  <span className="option-row__title">{tier.name}</span>
                  <span className="option-row__sub">
                    {tier.goal} breaks · {movementMinutes(tier.goal)} min a day
                  </span>
                </span>
                <span className={selected ? 'tier__tag' : 'tier__note'}>{tier.note}</span>
              </button>
            );
          })}
        </div>

        <Spacer />
        <CoachSays pose="wave">{TIER_LINES[chosen ?? 'none']}</CoachSays>
      </ScreenBody>

      <ScreenFooter>
        <Button onClick={next} disabled={chosen === null}>
          Continue
        </Button>
      </ScreenFooter>
    </Screen>
  );
}
