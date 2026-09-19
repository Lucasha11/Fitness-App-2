/**
 * Invariants — tier 1.
 *
 * The pose and tint maps key off string ids and body areas, so a renamed
 * exercise or a new region compiles and then renders a missing drawing.
 */

import { describe, expect, it } from 'vitest';
import { poseFor, poseForSet, tintFor } from './poses';
import { EXERCISES, EXERCISE_SETS } from '../exercises';
import { BODY_REGION_ORDER } from '../onboarding/state';

describe('the mascot pose map', () => {
  it('finds a pose for every exercise in the catalogue', () => {
    for (const exercise of EXERCISES) {
      expect(poseFor(exercise), exercise.id).toBeTruthy();
    }
  });

  it('finds a tint for every body area a user can pick', () => {
    for (const region of BODY_REGION_ORDER) {
      expect(tintFor(region), region).toBeTruthy();
    }
  });

  it('finds a pose for every curated set', () => {
    for (const set of EXERCISE_SETS) {
      expect(poseForSet(set), set.id).toBeTruthy();
    }
  });

  it('gives every pack its own art, so no two wear the same drawing', () => {
    const poses = EXERCISE_SETS.map(poseForSet);
    expect(new Set(poses).size).toBe(poses.length);
  });
});
