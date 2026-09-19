/**
 * Domain rules — tier 2.
 *
 * Each test name is a sentence about what the app promises the user. If a
 * rule here changes, the sentence should change with it: these read as the
 * spec, not as coverage.
 */

import { describe, expect, it } from 'vitest';
import { sittingHeadline, sittingLabel } from './sitting';

describe('the sitting clock', () => {
  it('counts in minutes for anything under an hour', () => {
    expect(sittingLabel(1)).toBe('1 minute');
    expect(sittingLabel(45)).toBe('45 minutes');
    expect(sittingLabel(59)).toBe('59 minutes');
  });

  it('switches to whole hours the moment the hour is up', () => {
    expect(sittingLabel(60)).toBe('1 hour');
    expect(sittingLabel(120)).toBe('2 hours');
  });

  it('drops the spare minutes once it is counting hours', () => {
    expect(sittingLabel(95)).toBe('1 hour');
    expect(sittingLabel(497)).toBe('8 hours');
  });

  it('nods at someone who has just got up rather than saying nothing', () => {
    expect(sittingHeadline(0)).toBe('You just got up — nice one.');
  });

  it('leads the header with how long the user has been sitting', () => {
    expect(sittingHeadline(497)).toBe('You’ve been sitting for 8 hours.');
  });
});
