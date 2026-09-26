import { describe, expect, it } from 'vitest'
import { SITE } from '../data/site'
import { openStatus } from './hours'

const at = (weekday: number, hm: string) => {
  const [h, m] = hm.split(':').map(Number)
  return { date: '2026-09-27', weekday, minutes: h * 60 + m }
}

describe('open status', () => {
  it('is open from 6 AM until 10 PM Sunday to Friday', () => {
    for (const day of [0, 1, 2, 3, 4, 5]) {
      expect(openStatus(at(day, '06:00'), SITE.hours)).toEqual({ kind: 'open', closes: '22:00' })
      expect(openStatus(at(day, '21:59'), SITE.hours)).toEqual({ kind: 'open', closes: '22:00' })
    }
  })

  it('says it opens at 6 AM before opening time', () => {
    expect(openStatus(at(2, '05:59'), SITE.hours)).toEqual({ kind: 'closed', opens: '06:00' })
  })

  it('says it opens at 6 AM tomorrow after closing time', () => {
    expect(openStatus(at(0, '22:00'), SITE.hours)).toEqual({ kind: 'closed', opens: '06:00' })
  })

  it('never guesses Saturday’s hours — it asks the visitor to call', () => {
    for (const hm of ['05:00', '12:00', '23:00']) {
      expect(openStatus(at(6, hm), SITE.hours)).toEqual({ kind: 'unconfirmed' })
    }
  })

  it('does not promise a Saturday opening time on Friday night', () => {
    expect(openStatus(at(5, '22:30'), SITE.hours)).toEqual({ kind: 'closed' })
  })
})
