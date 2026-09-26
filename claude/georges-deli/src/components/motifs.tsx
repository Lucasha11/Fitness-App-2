// The Honduran flag's five stars, a mint leaf and the flag itself. Kept as
// inline SVG so they take the current colour and cost no requests.

function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.4
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

// The flag's X: two stars left, one in the middle, two right.
const X = [
  [22, 14],
  [22, 46],
  [50, 30],
  [78, 14],
  [78, 46],
]

export function Stars({ className, size = 48 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size * 0.6} viewBox="0 0 100 60" aria-hidden="true" focusable="false">
      {X.map(([x, y]) => (
        <polygon key={`${x}-${y}`} points={starPoints(x, y, 11)} fill="currentColor" />
      ))}
    </svg>
  )
}

/** A section divider: a thin rule with the five stars in the middle. */
export function StarDivider() {
  return (
    <div className="star-divider" aria-hidden="true">
      <span />
      <Stars size={40} />
      <span />
    </div>
  )
}

export function Leaf({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      className={`leaf ${className ?? ''}`}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M6 34C6 16 18 5 36 4c0 18-11 30-30 30Z" fill="currentColor" />
      <path d="M8 32C16 22 24 14 33 7" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function Flag({ className }: { className?: string }) {
  return (
    <svg className={`flag ${className ?? ''}`} viewBox="0 0 100 60" role="img" aria-label="Honduran flag">
      <rect width="100" height="60" rx="4" fill="var(--sky)" />
      <rect y="20" width="100" height="20" fill="#fff" />
      {X.map(([x, y]) => (
        <polygon key={`${x}-${y}`} points={starPoints(40 + (x - 50) * 0.28, 30 + (y - 30) * 0.28, 3.2)} fill="var(--sky)" />
      ))}
    </svg>
  )
}
