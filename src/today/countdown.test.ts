/**
 * Domain rules — tier 2.
 *
 * Each test name is a sentence about what the app promises the user. If a
 * rule here changes, the sentence should change with it: these read as the
 * spec, not as coverage.
 */

import { describe, expect, it } from 'vitest';
import { countdownEyebrow, countdownLabel } from './countdown';

describe('the next-break countdown', () => {
  it('counts down in minutes for the next hour', () => {
    expect(countdownEyebrow(24)).toBe('NEXT BREAK IN 24 MIN');
    expect(countdownEyebrow(59)).toBe('NEXT BREAK IN 59 MIN');
  });

  it('rounds to the nearest whole hour once it is counting hours', () => {
    expect(countdownLabel(60)).toBe('1 HR');
    expect(countdownLabel(65)).toBe('1 HR');
    expect(countdownLabel(110)).toBe('2 HRS');
  });

  it('says a break is due rather than counting past zero', () => {
    expect(countdownEyebrow(0)).toBe('BREAK DUE NOW');
    expect(countdownEyebrow(-8)).toBe('BREAK DUE NOW');
  });
});
