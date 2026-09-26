import { describe, expect, it } from 'vitest'
import { href, parseRoute } from './route'

describe('routes', () => {
  it('opens the menu at a dish from a favourite card link', () => {
    expect(parseRoute(href('menu', { item: 'pupusas' }))).toEqual({ page: 'menu', item: 'pupusas', section: undefined })
  })

  it('opens the menu at a category from a home tile link', () => {
    expect(parseRoute(href('menu', { section: 'soups' })).section).toBe('soups')
  })

  it('falls back to home for an empty or unknown address', () => {
    expect(parseRoute('').page).toBe('home')
    expect(parseRoute('#/nope').page).toBe('home')
  })
})
