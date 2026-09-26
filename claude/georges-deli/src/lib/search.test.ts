import { describe, expect, it } from 'vitest'
import { MENU } from '../data/menu'
import { matchesQuery } from './search'

const find = (q: string) => MENU.filter((i) => matchesQuery(i, q)).map((i) => i.id)

describe('menu search', () => {
  it('finds a dish by its Spanish name, ignoring accents and case', () => {
    expect(find('yuca con chicharron')).toEqual(['yuca-con-chicharron'])
    expect(find('HONDUREÑOS')).toContain('tacos-hondurenos')
  })

  it('finds a dish by its English name', () => {
    expect(find('tripe')).toEqual(['sopa-de-mondongo'])
    expect(find('coffee')).toEqual(['cafe'])
  })

  it('finds pupusas by a filling', () => {
    expect(find('revueltas')).toEqual(['pupusas'])
  })

  it('shows everything for an empty search', () => {
    expect(find('  ')).toHaveLength(MENU.length)
  })
})
