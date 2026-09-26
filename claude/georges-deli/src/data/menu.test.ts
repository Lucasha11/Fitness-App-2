import { describe, expect, it } from 'vitest'
import { CATEGORIES, DRINK_GROUPS, MENU } from './menu'

describe('menu data', () => {
  it('gives every dish a unique id', () => {
    const ids = MENU.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('puts every dish in a known category, and every category has dishes', () => {
    const cats = new Set(CATEGORIES.map((c) => c.id))
    for (const item of MENU) expect(cats.has(item.category), item.id).toBe(true)
    for (const c of CATEGORIES) expect(MENU.some((i) => i.category === c.id), c.id).toBe(true)
  })

  it('files every drink under a drink group', () => {
    const groups = new Set(DRINK_GROUPS.map((g) => g.id))
    for (const item of MENU.filter((i) => i.category === 'drinks')) {
      expect(item.group && groups.has(item.group), item.id).toBe(true)
    }
  })

  it('gives every dish at least one positive price', () => {
    for (const item of MENU) {
      expect(item.prices.length, item.id).toBeGreaterThan(0)
      for (const p of item.prices) expect(p.amount, item.id).toBeGreaterThan(0)
    }
  })

  it('describes every non-drink dish in both languages', () => {
    for (const item of MENU.filter((i) => i.category !== 'drinks')) {
      expect(item.en, item.id).not.toBe('')
      expect(item.es, item.id).not.toBe('')
    }
  })

  it('only uses real weekdays for day-only dishes', () => {
    for (const item of MENU) for (const d of item.days ?? []) expect(d >= 0 && d <= 6, item.id).toBe(true)
  })

  it('features exactly the five home-page favourites, in menu order', () => {
    expect(MENU.filter((i) => i.featured).map((i) => i.name)).toEqual([
      'Desayuno Típico',
      'Baleada Regular',
      'Pollo con Tajadas',
      'Tacos Hondureños',
      'Pupusas',
    ])
  })
})
