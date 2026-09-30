/**
 * Domain rules — tier 2.
 *
 * What the paywall quotes is a promise about money. Each test name is that
 * promise in a sentence.
 */

import { describe, expect, it } from 'vitest';
import { PLANS, perMonth, planById, yearlySaving } from './plans';

describe('the paywall’s prices', () => {
  it('quotes the yearly plan per month rounded down, never up', () => {
    expect(perMonth(39.99)).toBe(3.33);
    expect(perMonth(40)).toBe(3.33);
    expect(perMonth(12)).toBe(1);
  });

  it('measures the yearly saving against twelve months of monthly, rounded down', () => {
    const yearly = planById('yearly').price;
    const monthly = planById('monthly').price;
    const exact = (1 - yearly / (monthly * 12)) * 100;
    expect(yearlySaving()).toBe(Math.floor(exact));
    expect(yearlySaving()).toBeLessThanOrEqual(exact);
  });

  it('offers each plan once', () => {
    const ids = PLANS.map((plan) => plan.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
