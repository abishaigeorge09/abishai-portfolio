// Brand logo: a brutalist stencil "AG" mark (s0animation-style glyph block).
// Swap point - edit the SVG paths in AgMark to rebrand; the accessible name
// stays. AgMark is the single source of truth for the glyph so the header
// wordmark (Logo) and the centered nav cluster's glyph (LogoMark) never drift
// apart.
import { Link } from 'react-router-dom'
import { site } from '../config/site'

export function AgMark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 136 100"
      fill="currentColor"
      aria-hidden="true"
      className={`block ${className}`}
    >
      <g transform="skewX(-8) translate(14 0)">
        {/* A: wedge leg fused into a full-height stem, stencil notch for the leg gap */}
        <path d="M2 98 L40 2 H66 V98 H44 V72 H27 L17 98 Z" />
        {/* G: square C opening right, floating spur slab in the mouth */}
        <path d="M78 2 H126 V30 H100 V70 H126 V98 H78 Z" />
        <rect x="106" y="44" width="20" height="26" />
      </g>
    </svg>
  )
}

export function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label={`${site.firstName} ${site.lastName} home`}
    >
      <AgMark className="h-[30px] w-[42px] shrink-0" />
      <span className="font-display text-lg font-bold">
        {site.firstName} {site.lastName}
      </span>
    </Link>
  )
}

// The mark used in the centered nav cluster, between the About/Work pills.
// Scaled to fit the white pill, always ink (currentColor), regardless of the
// wordmark's adaptive light/dark color elsewhere in Nav.
export function LogoMark({ className = '' }) {
  return <AgMark className={`h-[22px] w-auto text-ink ${className}`} />
}
