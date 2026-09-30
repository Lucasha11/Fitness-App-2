/**
 * What the paywall sells.
 *
 * PLACEHOLDERS. The prices are stand-ins until the App Store products exist;
 * when they do, the price shown must be the one StoreKit returns for the
 * user's storefront, not these numbers. Keep the ids: they become the
 * product identifiers' suffixes.
 */

export type PlanId = 'yearly' | 'monthly' | 'lifetime';

export interface Plan {
  id: PlanId;
  name: string;
  /** In dollars, as the storefront would quote it. */
  price: number;
  period: 'year' | 'month' | 'once';
}

/** The free week that comes with the yearly plan, and only with it. */
export const TRIAL_DAYS = 7;

/** How many days before the trial ends the reminder goes out. */
export const TRIAL_REMINDER_DAYS_BEFORE = 2;

export const PLANS: Plan[] = [
  { id: 'yearly', name: 'Yearly', price: 39.99, period: 'year' },
  { id: 'monthly', name: 'Monthly', price: 7.99, period: 'month' },
  { id: 'lifetime', name: 'Lifetime', price: 79.99, period: 'once' },
];

export function planById(id: PlanId): Plan {
  const plan = PLANS.find((item) => item.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

/** `39.99` -> `$39.99`. */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * A yearly price as a monthly figure, rounded down to the cent: quoting it a
 * cent high would overstate what the user pays, rounding up never happens.
 */
export function perMonth(yearlyPrice: number): number {
  return Math.floor((yearlyPrice * 100) / 12) / 100;
}

/**
 * The yearly plan's saving, as a whole percentage of paying monthly for
 * twelve months. Rounded down, so the badge never promises more than it is.
 */
export function yearlySaving(): number {
  const yearly = planById('yearly').price;
  const monthly = planById('monthly').price;
  return Math.floor((1 - yearly / (monthly * 12)) * 100);
}
