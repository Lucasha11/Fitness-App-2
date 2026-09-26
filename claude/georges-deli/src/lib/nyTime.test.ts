import { describe, expect, it } from 'vitest'
import { localClock } from './nyTime'

describe('localClock', () => {
  it('reads the day in Morristown, not in the visitor’s time zone', () => {
    // 03:30 UTC on a Monday is still Sunday evening in New Jersey.
    const clock = localClock(new Date('2026-09-28T03:30:00Z'))
    expect(clock).toEqual({ date: '2026-09-27', weekday: 0, minutes: 23 * 60 + 30 })
  })

  it('follows daylight saving time', () => {
    // January: UTC−5. 11:00 UTC is 6 AM.
    expect(localClock(new Date('2026-01-14T11:00:00Z')).minutes).toBe(6 * 60)
    // July: UTC−4. 10:00 UTC is 6 AM.
    expect(localClock(new Date('2026-07-15T10:00:00Z')).minutes).toBe(6 * 60)
  })
})
