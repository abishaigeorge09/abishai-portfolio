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
    const target = window.innerHeight
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { duration: 1.3 })
    } else {
      window.scrollTo({ top: target, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative z-30 flex justify-center">
      <button
        ref={ref}
        type="button"
        onClick={scrollToNext}
        aria-label="Explore"
        className="group -mt-[140px] flex h-[64px] w-12 flex-col items-center justify-between rounded-t-full bg-ink pb-2 pt-2.5 text-cream transition-transform duration-300 ease-spring-pill hover:-translate-y-1 md:-mt-[86px] md:h-[86px] md:w-16 md:pb-3 md:pt-4"
      >
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.18em]">Explore</span>
        <span aria-hidden="true" className="text-sm leading-none animate-bounce">
          ↓
        </span>
      </button>
    </div>
  )
}
