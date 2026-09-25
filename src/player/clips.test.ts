/**
 * Invariants — tier 1.
 *
 * Clips are found by filename and set tiles name an exercise by string id, so
 * a misspelt file or a renamed exercise compiles and quietly plays nothing.
 */

import { describe, expect, it } from 'vitest';
import { clipExerciseIdForSet, clipIds, clipsFromModules } from './clips';
import { EXERCISES, EXERCISE_SETS } from '../exercises';

const EXERCISE_IDS = new Set(EXERCISES.map((exercise) => exercise.id));

describe('the panda clip folder', () => {
  it('names only exercises that exist in the catalogue', () => {
    for (const id of clipIds()) {
      expect(EXERCISE_IDS.has(id), id).toBe(true);
    }
  });

  it('reads the exercise id from a clip file name', () => {
    const clips = clipsFromModules({
      '../assets/clips/panda-neck-rolls.webp': '/a.webp',
      '../assets/clips/panda-hip-90-90.webp': '/b.webp',
    });
    expect(clips.get('neck-rolls')).toBe('/a.webp');
    expect(clips.get('hip-90-90')).toBe('/b.webp');
  });

  it('ignores a file that is not a panda clip', () => {
    const clips = clipsFromModules({
      '../assets/clips/squirrel-neck-rolls.webp': '/a.webp',
      '../assets/clips/panda-neck-rolls.mp4': '/b.mp4',
    });
    expect(clips.size).toBe(0);
  });
});

describe('the pack tile clips', () => {
  it('gives every curated set an exercise to demonstrate', () => {
    for (const set of EXERCISE_SETS) {
      expect(clipExerciseIdForSet(set), set.id).toBeTruthy();
    }
  });

  it('demonstrates an exercise that is actually in the set', () => {
    for (const set of EXERCISE_SETS) {
      expect(set.exerciseIds, set.id).toContain(clipExerciseIdForSet(set));
    }
  });

  it('never plays the same clip on two packs', () => {
    const ids = EXERCISE_SETS.map(clipExerciseIdForSet);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
