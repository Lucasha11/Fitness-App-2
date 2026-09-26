import { describe, expect, it } from 'vitest'
import { daysOnly } from './i18n'

describe('day-only badge', () => {
  it('reads “Mondays only” in English and “Solo los lunes” in Spanish', () => {
    expect(daysOnly([1], 'en')).toBe('Mondays only')
    expect(daysOnly([1], 'es')).toBe('Solo los lunes')
  })

  it('joins several days naturally', () => {
    expect(daysOnly([0, 3], 'en')).toBe('Sundays & Wednesdays only')
    expect(daysOnly([0, 3], 'es')).toBe('Solo los domingos y miércoles')
  })
})
