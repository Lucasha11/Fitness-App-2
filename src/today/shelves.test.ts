/**
 * Domain rules — tier 2.
 *
 * Each test name is a sentence about what the app promises the user. If a
 * rule here changes, the sentence should change with it: these read as the
 * spec, not as coverage.
 */

import { describe, expect, it } from 'vitest';
import { buildShelves, countdownProgress, regionsOf } from './shelves';
import { EXERCISE_SETS, setExercises } from '../exercises';
import { initialState, type OnboardingState } from '../onboarding/state';
import {
  dateKey,
  emptySession,
  type CompletedBreak,
  type SessionState,
} from '../session/state';

function answersWith(overrides: Partial<OnboardingState> = {}): OnboardingState {
  return { ...initialState, ...overrides };
}

function sessionWith(overrides: Partial<SessionState> = {}): SessionState {
  return { ...emptySession(), ...overrides };
}

/** A break taken today in `region`, so a shelf can see the week's coverage. */
function aBreakIn(region: CompletedBreak['region']): CompletedBreak {
  return { exerciseId: 'neck-rolls', region, at: 10 * 60, slot: null, seconds: 60 };
}

function shelf(shelves: ReturnType<typeof buildShelves>, id: string) {
  return shelves.find((entry) => entry.id === id);
}

describe('the pack shelves on Today', () => {
  it('puts a hearted pack on the favourites shelf', () => {
    const shelves = buildShelves(
      answersWith(),
      sessionWith({ favouriteSetIds: ['neck-relief'] }),
    );

    expect(shelf(shelves, 'favourites')?.sets.map((set) => set.id)).toEqual([
      'neck-relief',
    ]);
  });

  it('keeps the favourites shelf even when nothing is hearted yet', () => {
    const shelves = buildShelves(answersWith(), sessionWith());

    expect(shelf(shelves, 'favourites')).toBeDefined();
    expect(shelf(shelves, 'favourites')?.sets).toEqual([]);
  });

  it('recommends the packs that cover the areas the user said bother them', () => {
    const shelves = buildShelves(
      answersWith({ bothers: ['hips'] }),
      sessionWith(),
    );

    const recommended = shelf(shelves, 'bothers');
    expect(recommended?.sets.length).toBeGreaterThan(0);
    for (const set of recommended?.sets ?? []) {
      expect(regionsOf(set)).toContain('hips');
    }
  });

  it('leads the recommendations with the pack covering the most sore areas', () => {
    const shelves = buildShelves(
      answersWith({ bothers: ['neck', 'eyes'] }),
      sessionWith(),
    );

    const [first, ...rest] = shelf(shelves, 'bothers')?.sets ?? [];
    const covered = (set: (typeof EXERCISE_SETS)[number]) =>
      regionsOf(set).filter((region) => ['neck', 'eyes'].includes(region)).length;

    for (const set of rest) {
      expect(covered(first)).toBeGreaterThanOrEqual(covered(set));
    }
  });

  it('drops a shelf rather than showing a heading over nothing', () => {
    const shelves = buildShelves(answersWith({ bothers: [] }), sessionWith());

    expect(shelf(shelves, 'bothers')).toBeUndefined();
  });

  it('drops a shelf left with a single pack by the shelves above it', () => {
    const shelves = buildShelves(answersWith(), sessionWith());

    for (const entry of shelves) {
      if (entry.id === 'favourites') continue;
      expect(entry.sets.length, entry.id).toBeGreaterThan(1);
    }
  });

  it('only offers packs that pass unnoticed on the camera-on shelf', () => {
    const shelves = buildShelves(answersWith(), sessionWith());

    for (const set of shelf(shelves, 'quiet')?.sets ?? []) {
      for (const exercise of setExercises(set)) {
        expect(exercise.subtle).toBe(true);
      }
    }
  });

  it('stops offering a body area once this week has covered it', () => {
    const today = dateKey();
    const everyRegion = [
      ...new Set(EXERCISE_SETS.flatMap((set) => regionsOf(set))),
    ];
    const allCovered = sessionWith({
      history: { [today]: everyRegion.map(aBreakIn) },
    });

    expect(shelf(buildShelves(answersWith(), allCovered), 'uncovered')).toBeUndefined();
    expect(shelf(buildShelves(answersWith(), sessionWith()), 'uncovered')).toBeDefined();
  });

  it('never offers the same pack on two shelves at once', () => {
    const shelves = buildShelves(
      answersWith({ bothers: ['neck', 'hips', 'eyes'] }),
      sessionWith({ favouriteSetIds: ['neck-relief', 'eyes-reset'] }),
    );

    const shown = shelves.flatMap((entry) => entry.sets.map((set) => set.id));
    expect(shown).toHaveLength(new Set(shown).size);
  });

  it('keeps a hearted pack on favourites rather than the shelf that would also claim it', () => {
    const shelves = buildShelves(
      answersWith({ bothers: ['hips'] }),
      sessionWith({ favouriteSetIds: ['hips-glutes'] }),
    );

    expect(shelf(shelves, 'favourites')?.sets.map((set) => set.id)).toContain(
      'hips-glutes',
    );

    const elsewhere = shelves
      .filter((entry) => entry.id !== 'favourites')
      .flatMap((entry) => entry.sets.map((set) => set.id));
    expect(elsewhere).not.toContain('hips-glutes');
  });
});

describe('the next-break dial', () => {
  it('fills as the break approaches and is full once it is due', () => {
    expect(countdownProgress(45, 45)).toBe(0);
    expect(countdownProgress(22.5, 45)).toBeCloseTo(0.5);
    expect(countdownProgress(0, 45)).toBe(1);
  });

  it('stays full rather than overflowing once a break is overdue', () => {
    expect(countdownProgress(-30, 45)).toBe(1);
  });

  it('never reads as more than a whole wait, however far off the break is', () => {
    expect(countdownProgress(200, 45)).toBe(0);
  });
});
