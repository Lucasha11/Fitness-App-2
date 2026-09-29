import { describe, expect, it } from 'vitest';
import { BODY_PART_LABELS, BODY_PART_ORDER, EXERCISES } from '../exercises';
import { LIBRARY_AXES, searchExercises, shelvesFor } from './catalogue';

describe('the library shelves', () => {
  it('files every move under exactly one body area', () => {
    const shelved = shelvesFor('area').flatMap((shelf) =>
      shelf.exercises.map((exercise) => exercise.id),
    );

    expect(new Set(shelved).size).toBe(shelved.length);
    expect(shelved.sort()).toEqual(EXERCISES.map((e) => e.id).sort());
  });

  it('files every move under exactly one body part', () => {
    const shelved = shelvesFor('part').flatMap((shelf) =>
      shelf.exercises.map((exercise) => exercise.id),
    );

    expect(new Set(shelved).size).toBe(shelved.length);
    expect(shelved.sort()).toEqual(EXERCISES.map((e) => e.id).sort());
  });

  it('gives every body part a shelf, head to feet', () => {
    expect(shelvesFor('part').map((shelf) => shelf.title)).toEqual(
      BODY_PART_ORDER.map((part) => BODY_PART_LABELS[part]),
    );
  });

  it('shelves a move by the part it works, not the reason to do it', () => {
    const legs = shelvesFor('part').find((shelf) => shelf.id === 'legs');

    // Onboarding files calf raises under low energy; the body shelves cannot.
    expect(legs?.exercises.map((exercise) => exercise.id)).toContain(
      'calf-raises',
    );
  });

  it('files every move under exactly one setting', () => {
    const shelved = shelvesFor('setting').flatMap((shelf) =>
      shelf.exercises.map((exercise) => exercise.id),
    );

    expect(new Set(shelved).size).toBe(shelved.length);
    expect(shelved.sort()).toEqual(EXERCISES.map((e) => e.id).sort());
  });

  it('lets one move sit on several shelves when the axis is sets', () => {
    const shelves = shelvesFor('sets');
    const shelved = shelves.flatMap((shelf) =>
      shelf.exercises.map((exercise) => exercise.id),
    );

    // Sets share moves on purpose — the shelf keeps the set's running order
    // rather than deduplicating across shelves the way the other axes do.
    expect(shelved.length).toBeGreaterThan(new Set(shelved).size);
    expect(shelves.every((shelf) => shelf.setId !== undefined)).toBe(true);
  });

  it('never shows a heading over a single card', () => {
    for (const axis of LIBRARY_AXES) {
      for (const shelf of shelvesFor(axis)) {
        expect(shelf.exercises.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('keeps the shelves in the order their axis defines', () => {
    expect(shelvesFor('area')[0].title).toBe('Neck');
    expect(shelvesFor('setting').map((shelf) => shelf.title)).toEqual([
      'At your desk',
      'Standing room',
    ]);
  });
});

describe('the library search', () => {
  it('finds a move by the body area it works, not just by its name', () => {
    const found = searchExercises('neck').map((exercise) => exercise.id);

    expect(found).toContain('neck-rolls');
    // Named for the muscle, not the area, so only the area match reaches it.
    expect(found).toContain('chin-tucks');
  });

  it('finds a move by the body part it works', () => {
    const found = searchExercises('legs').map((exercise) => exercise.id);

    expect(found).toContain('calf-raises');
    expect(found).toContain('desk-squats');
  });

  it('ignores case and surrounding space', () => {
    expect(searchExercises('  WRIST ').length).toBe(
      searchExercises('wrist').length,
    );
  });

  it('returns nothing at all for an empty query', () => {
    expect(searchExercises('')).toEqual([]);
    expect(searchExercises('   ')).toEqual([]);
  });
});
