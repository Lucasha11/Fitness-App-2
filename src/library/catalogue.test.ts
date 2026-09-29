import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../exercises';
import { LIBRARY_AXES, searchExercises, shelvesFor } from './catalogue';

describe('the library shelves', () => {
  it('files every move under exactly one body area', () => {
    const shelved = shelvesFor('area').flatMap((shelf) =>
      shelf.exercises.map((exercise) => exercise.id),
    );

    expect(new Set(shelved).size).toBe(shelved.length);
    expect(shelved.sort()).toEqual(EXERCISES.map((e) => e.id).sort());
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
