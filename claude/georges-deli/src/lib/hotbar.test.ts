import { describe, expect, it } from 'vitest'
import { parseHotBar, todaysHotBar } from './hotbar'

describe('hot bar post', () => {
  const post = parseHotBar({
    date: '2026-09-26',
    items: ['Pollo guisado', { es: 'Tajadas', en: 'Fried plantain chips' }],
  })

  it('shows the dishes when the post is dated today in New Jersey', () => {
    expect(todaysHotBar(post, '2026-09-26')).toEqual([
      'Pollo guisado',
      { es: 'Tajadas', en: 'Fried plantain chips' },
    ])
  })

  it('never shows yesterday’s post as today’s', () => {
    expect(todaysHotBar(post, '2026-09-27')).toBeNull()
  })

  it('never shows a post dated in the future', () => {
    expect(todaysHotBar(post, '2026-09-25')).toBeNull()
  })

  it('treats a post with no dishes as not posted', () => {
    expect(todaysHotBar(parseHotBar({ date: '2026-09-26', items: [] }), '2026-09-26')).toBeNull()
  })

  it('rejects a missing or malformed file', () => {
    expect(parseHotBar(null)).toBeNull()
    expect(parseHotBar('pollo')).toBeNull()
    expect(parseHotBar({ items: ['Pollo'] })).toBeNull()
    expect(parseHotBar({ date: '26/09/2026', items: ['Pollo'] })).toBeNull()
    expect(parseHotBar({ date: '2026-09-26', items: 'Pollo' })).toBeNull()
  })

  it('drops blank, malformed and duplicated dishes but keeps the rest', () => {
    const messy = parseHotBar({
      date: '2026-09-26',
      items: ['Arroz', '  ', 42, { en: 'Beans' }, 'arroz', { es: 'Frijoles' }, { es: 'Arroz', en: 'Rice' }],
    })
    expect(messy?.items).toEqual(['Arroz', { es: 'Frijoles', en: 'Frijoles' }])
  })
})
