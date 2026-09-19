/**
 * Invariants — tier 1.
 *
 * The catalogue is hand-written data, and sets reference exercises by string
 * id, so a typo compiles perfectly and fails at runtime in front of a user.
 * These tests are the type system the data does not have.
 */

import { describe, expect, it } from 'vitest';
import {
  EXERCISES,
  EXERCISES_PER_BREAK,
  EXERCISE_DURATION_CHOICES,
  EXERCISE_DURATION_SECONDS,
  EXERCISE_SETS,
  exerciseById,
  exercisesForRegion,
  isExerciseDuration,
  setExercises,
} from './exercises';
import { BODY_REGION_ORDER } from './onboarding/state';

describe('the exercise catalogue', () => {
  it('gives every exercise a unique id', () => {
    const ids = EXERCISES.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every exercise at least one coach cue', () => {
    for (const exercise of EXERCISES) {
      expect(exercise.cues.length, exercise.id).toBeGreaterThan(0);
    }
  });

  it('offers at least one exercise for every body area a user can pick', () => {
    // Onboarding lets the user choose any of these, so an empty region would
    // leave the scheduler with nothing to offer them.
    for (const region of BODY_REGION_ORDER) {
      expect(exercisesForRegion(region).length, region).toBeGreaterThan(0);
    }
  });
});

describe('curated sets', () => {
  it('holds exactly one break worth of exercises', () => {
    for (const set of EXERCISE_SETS) {
      expect(set.exerciseIds.length, set.id).toBe(EXERCISES_PER_BREAK);
    }
  });

  it('references only exercises that exist', () => {
    for (const set of EXERCISE_SETS) {
      expect(() => setExercises(set), set.id).not.toThrow();
    }
  });

  it('never repeats an exercise within one set', () => {
    for (const set of EXERCISE_SETS) {
      expect(new Set(set.exerciseIds).size, set.id).toBe(set.exerciseIds.length);
    }
  });

  it('gives every set a unique id', () => {
    const ids = EXERCISE_SETS.map((set) => set.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('exerciseById', () => {
  it('throws on an unknown id rather than returning undefined', () => {
    expect(() => exerciseById('not-a-real-exercise')).toThrow(/Unknown exercise/);
  });
});

describe('the break lengths on offer', () => {
  it('includes the default, so the start screen opens on a chosen option', () => {
    // The segmented control marks whichever choice matches the stored length.
    // A default outside the list would open it with nothing selected at all.
    expect(EXERCISE_DURATION_CHOICES).toContain(EXERCISE_DURATION_SECONDS);
  });

  it('lists the lengths longest first, the way the control reads them', () => {
    const lengths = [...EXERCISE_DURATION_CHOICES];
    expect(lengths).toEqual([...lengths].sort((a, b) => b - a));
  });

  it('gives every option a total of its own', () => {
    // Two choices that came to the same total would draw two identical
    // buttons, and picking either would look like nothing happened.
    const totals = EXERCISE_DURATION_CHOICES.map(
      (seconds) => seconds * EXERCISES_PER_BREAK,
    );
    expect(new Set(totals).size).toBe(totals.length);
  });

  it('turns every option into a whole number of seconds per exercise', () => {
    for (const seconds of EXERCISE_DURATION_CHOICES) {
      expect(Number.isInteger(seconds), String(seconds)).toBe(true);
    }
  });

  it('refuses a length it does not offer', () => {
    expect(isExerciseDuration(12)).toBe(false);
    expect(isExerciseDuration(EXERCISE_DURATION_SECONDS)).toBe(true);
  });
});
