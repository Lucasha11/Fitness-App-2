import { describe, expect, it } from 'vitest'
import { formatPrice, formatTime } from './format'

describe('price format', () => {
  it('prints whole dollars without cents, like the printed menu', () => {
    expect(formatPrice(24)).toBe('$24')
    expect(formatPrice(1)).toBe('$1')
  })

  it('prints anything else with two decimals', () => {
    expect(formatPrice(2.5)).toBe('$2.50')
    expect(formatPrice(1.5)).toBe('$1.50')
  })
})

describe('time format', () => {
  it('shows opening times as the sign on the door would', () => {
    expect(formatTime('06:00', 'en')).toBe('6 AM')
    expect(formatTime('22:00', 'en')).toBe('10 PM')
    expect(formatTime('12:30', 'en')).toBe('12:30 PM')
    expect(formatTime('22:00', 'es')).toBe('10 p. m.')
  })
})
