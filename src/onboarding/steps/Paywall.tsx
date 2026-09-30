import { useState } from 'react';
import { CheckIcon, LockIcon } from '../../components/icons';
import { Mascot } from '../../components/Mascot';
import { Button, Screen, ScreenFooter } from '../../components/ui';
import { EXERCISES } from '../../exercises';
import {
  PLANS,
  TRIAL_DAYS,
  TRIAL_REMINDER_DAYS_BEFORE,
  formatPrice,
  perMonth,
  planById,
  yearlySaving,
  type PlanId,
} from '../../purchases/plans';
import { purchase, restorePurchases } from '../../purchases/store';
import { openWebPage } from '../../settings/external';
import { PRIVACY_POLICY_URL, TERMS_URL } from '../../settings/links';
import type { StepProps } from '../types';

const PERKS = [
  'Your plan, laid out fresh every workday',
  `All ${EXERCISES.length} desk moves, no gym needed`,
  'Streaks, milestones and You vs. The Chair',
];

/** What each plan's card says under its name. */
function planLine(id: PlanId): string {
  if (id === 'yearly') {
    return `${TRIAL_DAYS} days free, then ${formatPrice(planById('yearly').price)} a year`;
  }
  if (id === 'monthly') return 'Billed monthly, no trial';
  return 'Pay once, keep it forever';
}

/** The button names what tapping it does, price included. */
function ctaLabel(id: PlanId): string {
  if (id === 'yearly') return 'Start my free week';
  const plan = planById(id);
  return id === 'monthly'
    ? `Subscribe for ${formatPrice(plan.price)} a month`
    : `Buy for ${formatPrice(plan.price)}`;
}

/** The terms under the button, in plain words, for whichever plan is lit. */
function finePrint(id: PlanId): string {
  const plan = planById(id);
  if (id === 'yearly') {
    return `Free for ${TRIAL_DAYS} days, then ${formatPrice(plan.price)} a year. We’ll remind you ${TRIAL_REMINDER_DAYS_BEFORE} days before. Cancel any time in Settings.`;
  }
  if (id === 'monthly') {
    return `${formatPrice(plan.price)} a month, renewing monthly. Cancel any time in Settings.`;
  }
  return `${formatPrice(plan.price)} once. No subscription.`;
}

/**
 * The unlock. It sits between a finished plan and its first break, so what
 * the user is buying is already on the screen before this one.
 */
export function Paywall({ state, set, next }: StepProps) {
  const [chosen, setChosen] = useState<PlanId>(state.plan ?? 'yearly');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const unlock = (plan: PlanId) => {
    set({ plan });
    next();
  };

  const buy = async () => {
    setBusy(true);
    setNotice(null);
    const outcome = await purchase(chosen);
    setBusy(false);
    if (outcome === 'purchased') return unlock(chosen);
    // Cancelling the sheet is a choice, not an error: say nothing.
    if (outcome === 'failed') setNotice('That didn’t go through. Nothing was charged.');
  };

  const restore = async () => {
    setBusy(true);
    setNotice(null);
    const restored = await restorePurchases();
    setBusy(false);
    if (restored) return unlock(restored);
    setNotice('No earlier purchase found.');
  };

  return (
    <Screen className="paywall" labelledBy="paywall-title">
      <div className="paywall__top">
        <button type="button" className="paywall__restore" onClick={restore} disabled={busy}>
          Restore
        </button>
      </div>

      <div className="paywall__hero">
        <span className="paywall__halo">
          <Mascot name="wave" size={112} />
        </span>
        <h1 className="title title--flush" id="paywall-title">
          Unlock your plan
        </h1>
      </div>

      <ul className="perks">
        {PERKS.map((perk) => (
          <li key={perk}>
            <span className="perks__tick" aria-hidden="true">
              <CheckIcon size={13} />
            </span>
            {perk}
          </li>
        ))}
      </ul>

      <div className="note paywall__saved">
        <span className="paywall__saved-icon" aria-hidden="true">
          <LockIcon size={18} />
        </span>
        <span>
          Your {state.dailyGoal}-break plan is saved and waiting, with a score
          to settle.
        </span>
      </div>

      <div className="plans" role="radiogroup" aria-label="Plans">
        {PLANS.map((plan) => {
          const selected = plan.id === chosen;
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className="plan-card"
              onClick={() => setChosen(plan.id)}
            >
              {plan.id === 'yearly' ? (
                <span className="plan-card__ribbon">
                  Best value · Save {yearlySaving()}%
                </span>
              ) : null}
              <span className="plan-card__radio" aria-hidden="true" />
              <span className="plan-card__text">
                <span className="plan-card__name">{plan.name}</span>
                <span className="plan-card__sub">{planLine(plan.id)}</span>
              </span>
              <span className="plan-card__price">
                {plan.period === 'year' ? formatPrice(perMonth(plan.price)) : formatPrice(plan.price)}
                {plan.period === 'once' ? null : <small>/mo</small>}
              </span>
            </button>
          );
        })}
      </div>

      <ScreenFooter>
        {notice ? (
          <p className="paywall__notice" role="status">
            {notice}
          </p>
        ) : null}
        <Button onClick={buy} disabled={busy}>
          {ctaLabel(chosen)}
        </Button>
        <p className="paywall__fine">
          {finePrint(chosen)}
          <br />
          <button type="button" onClick={() => void openWebPage(TERMS_URL)}>
            Terms
          </button>{' '}
          ·{' '}
          <button type="button" onClick={() => void openWebPage(PRIVACY_POLICY_URL)}>
            Privacy
          </button>
        </p>
      </ScreenFooter>
    </Screen>
  );
}
