// Hash routes, so the site deploys to any static host with no rewrite rules.
//   #/menu?item=pupusas   opens the menu at a dish
//   #/menu?section=soups  opens the menu at a category

export const PAGES = ['home', 'menu', 'hot-bar', 'catering', 'gallery', 'about', 'visit'] as const
export type Page = (typeof PAGES)[number]

export interface Route {
  page: Page
  item?: string
  section?: string
}

export function parseRoute(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?')
  const page = (PAGES as readonly string[]).includes(path) ? (path as Page) : 'home'
  const params = new URLSearchParams(query)
  return {
    page,
    item: params.get('item') ?? undefined,
    section: params.get('section') ?? undefined,
  }
}

export function href(page: Page, params?: { item?: string; section?: string }): string {
  const base = page === 'home' ? '#/' : `#/${page}`
  const q = new URLSearchParams(params as Record<string, string>).toString()
  return q ? `${base}?${q}` : base
}
