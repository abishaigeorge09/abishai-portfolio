// EXPLORE pill, re-anchored into the page flow (reference behavior): it is
// the first thing rendered inside the scrolling cream sheet, pulled up with a
// negative margin so at scroll 0 it visually sits at the hero's fold exactly
// where the old fixed pill used to. Because it now lives in normal flow it
// rides UP with the sheet automatically as you scroll; a ScrollTrigger on top
// of that fades it to 0 by roughly the midpoint of the hero's pin span so it
// is gone well before the sheet's content clears it.
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'

export function ExplorePill() {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return
    const heroPin = document.querySelector('[data-hero-pin]')
    if (!heroPin) return

    const trigger = ScrollTrigger.create({
      trigger: heroPin,
      start: 'top top',
      end: () => window.innerHeight,
      scrub: 0.3,
      onUpdate(self) {
        // opacity 1 -> 0 across the first ~50% of the hero's scroll span
        const local = gsap.utils.clamp(0, 1, self.progress / 0.5)
        ref.current.style.opacity = String(1 - local)
        ref.current.style.pointerEvents = local >= 1 ? 'none' : 'auto'
      },
    })
    return () => trigger.kill()
  }, [])

  const scrollToNext = () => {
    // pop first (founder-approved feel), then glide down
    if (ref.current && !prefersReducedMotion()) {
      gsap.timeline()
        .to(ref.current, { scale: 1.22, rotate: -4, duration: 0.16, ease: 'power2.out' })
        .to(ref.current, { scale: 1, rotate: 0, duration: 0.3, ease: 'back.out(2.5)' })
    }
    const target = window.innerHeight
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { duration: 1.3 })
    } else {
      window.scrollTo({ top: target, behavior: 'smooth' })
    }
  }

  return (
    // Desktop only: on phones the pill crowded the avatar and the bottom nav.
    <div className="relative z-30 hidden justify-center md:flex">
      <button
        ref={ref}
        type="button"
        onClick={scrollToNext}
        aria-label="Explore"
        className="group -mt-[68px] inline-flex h-12 items-center gap-3 rounded-full bg-ink pl-7 pr-2 text-cream shadow-[0_16px_40px_-16px_rgba(17,17,17,0.55)] transition-all duration-300 ease-spring-pill hover:-translate-y-1 hover:bg-blue hover:shadow-[0_22px_48px_-16px_rgba(46,84,254,0.55)]"
      >
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.24em]">Explore</span>
        {/* arrow chip: white disc, arrow nudges down on hover */}
        <span
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-full bg-cream text-ink transition-transform duration-300 ease-spring-pill group-hover:rotate-0 group-hover:scale-105"
        >
          <svg
            width="13"
            height="14"
            viewBox="0 0 13 14"
            fill="none"
            className="transition-transform duration-300 ease-spring-pill group-hover:translate-y-0.5"
          >
            <path d="M6.5 1v10M2 7.5L6.5 12 11 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  )
}
