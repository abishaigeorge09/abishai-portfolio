// Brand logo: a brutalist stencil "AG" mark (s0animation-style glyph block).
// Swap point - edit the SVG paths here to rebrand; the accessible name stays.
import { Link } from 'react-router-dom'
import { site } from '../config/site'

export function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`flex items-center transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label={`${site.firstName} ${site.lastName} home`}
    >
      <svg
        width="42"
        height="30"
        viewBox="0 0 136 100"
        fill="currentColor"
        aria-hidden="true"
        className="block"
      >
        <g transform="skewX(-8) translate(14 0)">
          {/* A: wedge leg fused into a full-height stem, stencil notch for the leg gap */}
          <path d="M2 98 L40 2 H66 V98 H44 V72 H27 L17 98 Z" />
          {/* G: square C opening right, floating spur slab in the mouth */}
          <path d="M78 2 H126 V30 H100 V70 H126 V98 H78 Z" />
          <rect x="106" y="44" width="20" height="26" />
        </g>
      </svg>
      <span className="sr-only">
        {site.firstName} {site.lastName}
      </span>
    </Link>
  )
}

// The square "iii" mark used in the centered nav cluster. Swap the inner mark
// (text or a Lottie/SVG) to change the logo glyph.
export function LogoMark({ className = '' }) {
  return <span className={`font-display text-base font-bold italic text-blue ${className}`}>iii</span>
}
