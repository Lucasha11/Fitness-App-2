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
  EXERCISE_SETS,
  exerciseById,
  exercisesForRegion,
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
