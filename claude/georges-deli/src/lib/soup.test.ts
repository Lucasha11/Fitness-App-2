import { describe, expect, it } from 'vitest'
import { soupSchedule, soupsForDay, EVERYDAY_SOUPS } from './soup'

const names = (weekday: number) => soupsForDay(weekday).map((s) => s.name)

describe('today’s soup', () => {
  it('is Sopa de Pollo on Mondays', () => {
    expect(names(1)).toEqual(['Sopa de Pollo'])
  })

  it('is Sopa de Frijoles on Wednesdays', () => {
    expect(names(3)).toEqual(['Sopa de Frijoles'])
  })

  it('is Sopa de Res and Sopa de Mondongo on Sundays', () => {
    expect(names(0)).toEqual(['Sopa de Res', 'Sopa de Mondongo'])
  })

  it('has no day-only soup on Tuesday, Thursday, Friday or Saturday, so the schedule shows instead', () => {
    for (const day of [2, 4, 5, 6]) expect(names(day)).toEqual([])
  })

  it('lists the weekly schedule Monday first', () => {
    expect(soupSchedule().map((r) => r.weekday)).toEqual([1, 3, 0])
  })

  it('keeps Sopa de Mariscos on every day', () => {
    expect(EVERYDAY_SOUPS.map((s) => s.name)).toEqual(['Sopa de Mariscos'])
  })
})
