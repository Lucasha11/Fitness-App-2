// Small brick-red line icons, drawn on a 24px grid. Stroke is currentColor.
import type { ReactNode } from 'react'
import type { CategoryId } from '../data/menu'

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export const PhoneIcon = () => (
  <svg {...base}>
    <path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z" />
  </svg>
)
export const MenuIcon = () => (
  <svg {...base}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
export const CloseIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const PinIcon = () => (
  <svg {...base}>
    <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)
export const ClockIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
export const SearchIcon = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)
export const InstagramIcon = () => (
  <svg {...base}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
  </svg>
)
export const ArrowIcon = () => (
  <svg {...base}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
export const BagIcon = () => (
  <svg {...base}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
)

const CATEGORY_ICONS: Record<CategoryId, ReactNode> = {
  breakfast: (
    <svg {...base}>
      <ellipse cx="12" cy="13" rx="8" ry="6" />
      <circle cx="13" cy="12" r="2.6" />
    </svg>
  ),
  baleadas: (
    <svg {...base}>
      <path d="M3 15a9 9 0 0 1 18 0Z" />
      <path d="M7 12c1.5-.8 3-.8 4.5 0s3 .8 4.5 0" />
    </svg>
  ),
  plates: (
    <svg {...base}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
    </svg>
  ),
  tacos: (
    <svg {...base}>
      <path d="M4 17c0-5 3.6-9 8-9s8 4 8 9Z" />
      <path d="M8 13l1 1m3-3v1.5m3 .5-1 1" />
    </svg>
  ),
  pupusas: (
    <svg {...base}>
      <ellipse cx="12" cy="12" rx="8" ry="7" />
      <path d="M8.5 10.5h.01M14 9h.01M12 14h.01M15.5 13h.01" strokeWidth="2.6" />
    </svg>
  ),
  soups: (
    <svg {...base}>
      <path d="M3 11h18a9 9 0 0 1-18 0Z" />
      <path d="M9 7c0-1 1-1.5 1-2.5M14 7c0-1 1-1.5 1-2.5" />
    </svg>
  ),
  drinks: (
    <svg {...base}>
      <path d="M6 7h12l-1.5 13h-9L6 7Z" />
      <path d="M13 7l2-4h3" />
    </svg>
  ),
}

export const CategoryIcon = ({ id }: { id: CategoryId }) => <>{CATEGORY_ICONS[id]}</>
