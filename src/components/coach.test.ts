/**
 * Domain rules — tier 2.
 *
 * Each test name is a sentence about what the app promises the user.
 */

import { describe, expect, it } from 'vitest';
import { COACHES, COACH_PROFILES, availableCoach } from './coach';

describe('coach availability', () => {
  it('brings someone who picked the retired squirrel back as the panda', () => {
    expect(availableCoach('squirrel')).toBe('panda');
  });

  it('gives a missing or garbled saved coach the panda', () => {
    expect(availableCoach(undefined)).toBe('panda');
    expect(availableCoach('otter')).toBe('panda');
  });

  it('keeps a saved coach that is still on offer', () => {
    for (const coach of COACHES) expect(availableCoach(coach)).toBe(coach);
  });

  it('offers only the coaches on the list, with a profile for each', () => {
    expect(COACH_PROFILES.map((profile) => profile.value)).toEqual(COACHES);
  });
});
