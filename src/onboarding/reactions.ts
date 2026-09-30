import type {
  DayType,
  GoalTier,
  Intensity,
  Interval,
  SittingBand,
  Visibility,
} from './state';

/*
 * What the coach says back to each answer. Warm, a little smug, and never a
 * scold: "none" is the line before anything is picked, so a screen is never
 * silent while it waits.
 */

export const SITTING_LINES: Record<SittingBand | 'none', string> = {
  none: 'Be honest. I’ve seen worse.',
  under4: 'Under four? Look at you. Let’s keep it that way.',
  '4to6': 'Pretty typical. We can work with that.',
  '6to8': 'That’s a lot of chair. Nothing we can’t fix.',
  '8plus': 'Chair-bound. I respect the honesty.',
};

export const DAY_TYPE_LINES: Record<DayType | 'none', string> = {
  none: 'No wrong answers. I’ve met every kind of chair.',
  desk: 'A desk job. Chair territory. We’ll fix that.',
  hybrid: 'Two desks means twice the chairs. I’ll follow you.',
  driver: 'The driver’s seat is still a chair. Stops are our time.',
  student: 'Lectures, library, laptop. That’s a lot of chairs.',
  shift: 'Odd hours? I keep odd hours too.',
  home: 'The sofa counts. Sorry.',
};

export const VISIBILITY_LINES: Record<Visibility, string> = {
  private: 'The whole room is yours. Go big.',
  some: 'Polite company. I’ll keep it tidy.',
  open: 'Stealth mode. I can be very quiet.',
};

export const INTENSITY_LINES: Record<Intensity, string> = {
  gentle: 'Gentle it is. Slow and steady wins this one.',
  moderate: 'A little effort, no sweat. Literally.',
  energetic: 'Energetic! I’d better stretch first.',
};

export const INTERVAL_LINES: Record<`${Interval}`, string> = {
  auto: 'I’ll pick the moments. Trust me.',
  30: 'Every half hour. Keen. I like it.',
  45: 'Every 45 minutes. A good rhythm.',
  60: 'Once an hour. Easy to keep up.',
  90: 'Every 90. Gentle, and still better than none.',
};

export const TIER_LINES: Record<GoalTier | 'none', string> = {
  none: 'Pick a pace. You can change it any time.',
  easy: 'Easy going. Small wins still count.',
  steady: 'Steady it is. The chair doesn’t stand a chance.',
  slayer: 'Chair slayer. Bold. I’m in.',
};
