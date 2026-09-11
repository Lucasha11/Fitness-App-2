/**
 * The token catalogue the design system page documents.
 *
 * Only names and intent live here — the values are read from the live
 * stylesheet at render time, so a swatch can never show a colour the app
 * isn't actually using.
 */

export interface TokenSpec {
  name: string;
  use: string;
  /** Pale swatches need a hairline or they vanish into the canvas. */
  outlined?: boolean;
}

export const COLOR_TOKENS: TokenSpec[] = [
  { name: '--bg', use: 'Warm off-white · app canvas', outlined: true },
  { name: '--surface', use: 'Pure white · card surfaces', outlined: true },
  { name: '--fill', use: 'Pale sage · tracks, inactive fills' },
  { name: '--line', use: 'Hairlines, dividers' },
  { name: '--ink', use: 'Warm near-black · body text' },
  { name: '--ink-muted', use: 'Secondary text on light' },
  { name: '--ink-on-accent', use: 'Text on accent and dark grounds', outlined: true },
  { name: '--accent', use: 'Coral-orange · CTAs, active states' },
  { name: '--accent-pressed', use: 'Hover and press on primary' },
  { name: '--accent-deep', use: 'Deep plum · gradients, emphasis' },
  { name: '--mint', use: 'Mint · calm backdrop tints' },
  { name: '--mint-deep', use: 'Soft green · secondary emphasis' },
  { name: '--lime', use: 'Lime-yellow · streak and progress fills' },
  { name: '--lime-ink', use: 'Text on lime' },
  { name: '--violet', use: 'Lavender · rare highlight tiles' },
  { name: '--warning', use: 'Amber · "you have been sitting a while"' },
  { name: '--warning-strong', use: 'The deeper amber the indicator dot uses' },
  { name: '--danger', use: 'Reserved · no destructive action ships yet' },
];

export const RADIUS_TOKENS: TokenSpec[] = [
  { name: '--radius-sm', use: 'Category tags' },
  { name: '--radius-inner', use: 'Icon tiles, segmented items' },
  { name: '--radius-control', use: 'Buttons, timeline rows' },
  { name: '--radius-card-sm', use: 'Option cards' },
  { name: '--radius-card', use: 'Standard cards' },
  { name: '--radius-sheet', use: 'Sheets and hero cards' },
  { name: '--radius-device', use: 'The phone shell itself' },
];

export const SHADOW_TOKENS: TokenSpec[] = [
  { name: '--shadow-card', use: 'Default card lift, plum-tinted' },
  { name: '--shadow-card-strong', use: 'Cards that need to sit forward' },
  { name: '--shadow-accent', use: 'Primary-tinted, under CTA buttons' },
  { name: '--shadow-device', use: 'The phone shell on a desktop canvas' },
];

/** Reads a custom property off the document root, trimmed. */
export function tokenValue(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
