// Top nav: logo left, social ICONS + a subtle résumé link right. The [About][iii][Work]
// cluster sits centered at the top on desktop and drops to a floating bar at the
// BOTTOM on mobile.
//
// Color adapts to the background: we sample the luminance of whatever sits behind the
// bar (and behind the cluster) on scroll, and flip the text between dark (on light
// backgrounds) and cream (on dark backgrounds). This is reliable everywhere, unlike
// mix-blend which doesn't composite across the page's stacking contexts.
import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { socials } from '../data/socials'
import { site } from '../config/site'
import { Logo, LogoMark } from './Logo'
import { SocialIcon } from './SocialIcon'

// Luminance (0-255) of the first opaque background behind point (x,y), skipping the nav.
function bgLuminanceAt(x, y) {
  const els = document.elementsFromPoint(x, y)
  for (const el of els) {
    if (el.closest('[data-nav-skip]')) continue
    const bg = getComputedStyle(el).backgroundColor
    const m = bg.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/)
    if (m && (m[4] === undefined || +m[4] > 0.4)) {
      return 0.2126 * +m[1] + 0.7152 * +m[2] + 0.0722 * +m[3]
    }
  }
  return 250 // assume light if nothing opaque found
}

function PillLink({ to, dark, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-full border px-4 py-2 font-display text-sm font-semibold backdrop-blur-md transition-transform duration-300 ease-spring-pill hover:scale-110',
          // Both idle variants carry a real fill, not a 5% tint. The luminance
          // probe below reads element BACKGROUND COLOURS, so it is blind to
          // <img> content: over the hero it sees the grey section behind the
          // cut-out and picks dark text while the actual pixels are a near-black
          // shirt, which made "About" vanish completely. A pill that is opaque
          // enough to read on either background turns that class of mistake
          // (including the probe's 250ms polling lag) from illegible into merely
          // slightly-off-tone.
          isActive
            ? 'border-transparent bg-ink/80 text-cream'
            : dark
              ? 'border-cream/25 bg-ink/55 text-cream'
              : 'border-ink/15 bg-cream/75 text-ink',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function Nav() {
  useLocation() // re-render on route change for active styling
  const [topDark, setTopDark] = useState(false)
  const [clusterDark, setClusterDark] = useState(false)

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const w = window.innerWidth
      const h = window.innerHeight
      const isMobile = w < 768
      // sample where the brand actually sits: left on desktop, centered on mobile
      const brandX = isMobile ? w * 0.5 : 84
      setTopDark(bgLuminanceAt(brandX, 26) < 140)
      // cluster: bottom-center on mobile, top-center on desktop
      setClusterDark(bgLuminanceAt(w * 0.5, isMobile ? h - 34 : 18) < 140)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.__lenis?.on('scroll', onScroll)
    // poll as a fallback so pinned/scrubbed sections (which can change what's behind
    // the bar without a scroll delta) still update the contrast.
    const iv = setInterval(measure, 250)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.__lenis?.off('scroll', onScroll)
      clearInterval(iv)
      if (raf) cancelAnimationFrame(raf)
    }
  })

  const topText = topDark ? 'text-cream' : 'text-ink'

  return (
    <>
      {/* top bar - name left + socials right on desktop, name centered on mobile */}
      <header data-nav-skip className="pointer-events-none fixed inset-x-0 top-0 z-nav">
        <nav className="pointer-events-auto mx-auto flex max-w-[1600px] items-center justify-center px-5 py-4 md:justify-between md:px-10">
          <Logo className={`${topText} transition-colors duration-300`} />

          {/* résumé + socials - hidden on phone */}
          <div className={`hidden items-center gap-4 transition-colors duration-300 md:flex md:gap-5 ${topText}`}>
            {site.resumeUrl && (
              <a
                href={site.resumeUrl}
                download
                target="_blank"
                rel="noopener"
                className="flex items-center gap-1.5 font-display text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                Résumé
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M8 10L4.5 6.5M8 10l3.5-3.5M3 14h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}

            <div className="flex items-center gap-3.5">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target={s.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={s.name}
                  data-cursor={s.cursor || undefined}
                  className="transition-transform duration-300 ease-spring-social hover:-translate-y-0.5"
                >
                  <SocialIcon name={s.key} />
                </a>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* center cluster - individual floating glass buttons; bottom on mobile, top on desktop */}
      <div
        data-nav-skip
        className="pointer-events-auto fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-nav flex -translate-x-1/2 items-center gap-3 md:bottom-auto md:top-4 md:gap-2"
      >
        <PillLink to="/about" dark={clusterDark}>
          About
        </PillLink>
        <Link
          to="/"
          aria-label="Home"
          className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-md transition-transform duration-300 ease-spring-pill hover:scale-110"
        >
          <LogoMark />
        </Link>
        <PillLink to="/work" dark={clusterDark}>
          Work
        </PillLink>
      </div>
    </>
  )
}
