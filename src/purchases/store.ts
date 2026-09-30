import type { PlanId } from './plans';

/**
 * The seam StoreKit will fill.
 *
 * STUB. There are no App Store products yet, so buying always succeeds
 * without charging and there is never anything to restore. The paywall only
 * talks to these two functions, so wiring a StoreKit plugin in here is the
 * whole job; nothing on screen needs to change.
 */

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'failed';

export async function purchase(plan: PlanId): Promise<PurchaseOutcome> {
  void plan;
  return 'purchased';
}

/** The plan an earlier purchase on this Apple ID grants, if any. */
export async function restorePurchases(): Promise<PlanId | null> {
  return null;
}
