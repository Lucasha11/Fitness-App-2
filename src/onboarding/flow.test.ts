/**
 * Domain rules — tier 2.
 *
 * Each test name is a sentence about what onboarding promises the user. If a
 * rule here changes, the sentence should change with it.
 */

import { describe, expect, it } from 'vitest';
import {
  GOAL_TIERS,
  SITTING_BANDS,
  SITTING_BAND_ORDER,
  WORKDAYS_A_YEAR,
  chairDaysPerYear,
  chairHoursPerYear,
  tierForGoal,
} from './state';
import {
  CHAPTERS,
  FLOW,
  chapterIndex,
  nextStep,
  questionNumber,
  type StepId,
} from './types';

const order = (id: StepId) => FLOW.findIndex((step) => step.id === id);

describe('the onboarding path', () => {
  it('walks the chapters in order: the ache, the fix, your plan, then the unlock', () => {
    const visited = FLOW.map((step) => chapterIndex(step.id) ?? -1);
    expect(visited).toEqual([...visited].sort((a, b) => a - b));
    expect(new Set(visited).size).toBe(CHAPTERS.length);
  });

  it('shows the paywall only once the plan is built, and before the welcome', () => {
    expect(order('paywall')).toBeGreaterThan(order('planReady'));
    expect(nextStep('planReady')).toBe('paywall');
    expect(nextStep('paywall')).toBe('welcome');
  });

  it('asks how long the user sat before it shows the score that answer sets', () => {
    expect(nextStep('sitting')).toBe('scoreboard');
  });

  it('ends at the welcome', () => {
    expect(nextStep('welcome')).toBeNull();
  });

  it('keeps the account detour and the coach picker off the main path', () => {
    expect(order('signIn')).toBe(-1);
    expect(order('coach')).toBe(-1);
    expect(nextStep('signIn')).toBeNull();
    expect(chapterIndex('signIn')).toBeNull();
  });

  it('numbers only the questions the plan is built from, in the order they are asked', () => {
    const numbered = FLOW.map((step) => questionNumber(step.id)).filter(
      (question) => question !== null,
    );
    expect(numbered.map((question) => question.n)).toEqual(
      numbered.map((_, index) => index + 1),
    );
    expect(new Set(numbered.map((question) => question.of))).toEqual(
      new Set([numbered.length]),
    );
    expect(questionNumber('paywall')).toBeNull();
    expect(questionNumber('notifications')).toBeNull();
  });

  it('never numbers a question outside the plan chapter', () => {
    for (const step of FLOW) {
      if (questionNumber(step.id)) expect(step.chapter).toBe('plan');
    }
  });
});

describe('You vs. The Chair', () => {
  it("scores the chair a band's hours on each of 240 working days", () => {
    expect(WORKDAYS_A_YEAR).toBe(240);
    for (const band of SITTING_BAND_ORDER) {
      expect(chairHoursPerYear(band)).toBe(SITTING_BANDS[band].hours * 240);
    }
  });

  it('takes the floor of the open-ended band, so the chair is never scored more than was said', () => {
    expect(SITTING_BANDS['8plus'].hours).toBe(8);
  });

  it('scores the chair higher the longer the user sits', () => {
    const scores = SITTING_BAND_ORDER.map(chairHoursPerYear);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
    expect(new Set(scores).size).toBe(scores.length);
  });

  it('turns the chair’s hours into whole days for the headline', () => {
    expect(chairDaysPerYear('8plus')).toBe(80);
  });
});

describe('difficulty tiers', () => {
  it('asks more breaks of each harder tier', () => {
    const goals = GOAL_TIERS.map((tier) => tier.goal);
    expect(goals).toEqual([...goals].sort((a, b) => a - b));
    expect(new Set(goals).size).toBe(goals.length);
  });

  it('recognises the tier a goal came from', () => {
    for (const tier of GOAL_TIERS) expect(tierForGoal(tier.goal)).toBe(tier.id);
  });

  it('reads a goal between tiers as no tier rather than the nearest one', () => {
    expect(tierForGoal(5)).toBeNull();
  });
});
