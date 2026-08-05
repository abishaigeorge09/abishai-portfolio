// Hero - one flat grey and a cut-out figure. Nothing else.
//
// The artwork's gradient, its pixel-type name and its baked copy are all gone;
// what ships is the portrait with a real alpha channel standing on
// var(--hero-grey). Do not put a gradient back behind it.
//
// It is built to be covered. Home.jsx pins this section (`sticky top-0 z-0`)
// and floats the cream sheet up over it, so the scroll tween below eases the
// figure down and back as the sheet climbs. The two read as one gesture rather
// than two things moving at once.
//
// Heights are svh, never vh. `100vh` is the viewport with the mobile browser
// chrome hidden, so at first paint anything centred against it sits too low and
// only settles once you scroll. That was the "not centered till a certain
// scroll" bug.
import { useEffect, useRef } from 'react'
// Importing from lib/gsap is what registers ScrollTrigger, which the scrub below
// relies on, so keep this import even though only `gsap` is named.
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { useIsTouch } from '../lib/useIsTouch'

export function Hero() {
  const section = useRef(null)
  const drift = useRef(null) // cursor parallax lives here
  const figure = useRef(null) // reveal + scroll tweens live here
  const isTouch = useIsTouch()

  useEffect(() => {
    const sec = section.current
    const fig = figure.current
    if (!sec || !fig || prefersReducedMotion()) return

    let ctx
    let failsafe = 0

    // The reveal itself is the CSS `hero-rise` animation (see styles/index.css).
    // Once it finishes we drop the class and let GSAP own the transform, so the
    // reveal and the scroll scrub never write to it at the same time.
    const handOver = () => {
      clearTimeout(failsafe)
      if (!fig.classList.contains('hero-rise') && ctx) return
      fig.classList.remove('hero-rise')
      ctx = gsap.context(() => {
        gsap.to(fig, {
          yPercent: 10,
          scale: 0.95,
          ease: 'none',
          scrollTrigger: { start: 0, end: () => window.innerHeight * 0.9, scrub: 0.6 },
        })
      }, sec)
    }

    fig.addEventListener('animationend', handOver, { once: true })
    // animationend never fires if the animation was skipped entirely (reduced
    // motion, or a browser that ignored it). The figure is already visible in
    // that case, so this only makes sure the scrub still gets attached.
    failsafe = setTimeout(handOver, 2600)

    return () => {
      clearTimeout(failsafe)
      fig.removeEventListener('animationend', handOver)
      ctx?.revert()
    }
  }, [])

  // Cursor parallax, pointer devices only. Applied to a wrapper so it cannot
  // collide with the transforms GSAP owns on the figure itself.
  useEffect(() => {
    const sec = section.current
    const el = drift.current
    if (!sec || !el || isTouch || prefersReducedMotion()) return

    const xTo = gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' })
    let raf = 0
    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const r = sec.getBoundingClientRect()
        xTo(((e.clientX - r.left) / r.width - 0.5) * -26)
        yTo(((e.clientY - r.top) / r.height - 0.5) * -14)
        raf = 0
      })
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }
    sec.addEventListener('mousemove', onMove, { passive: true })
    sec.addEventListener('mouseleave', onLeave)
    return () => {
      sec.removeEventListener('mousemove', onMove)
      sec.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
      gsap.killTweensOf(el)
    }
  }, [isTouch])

  return (
    <section
      ref={section}
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-end overflow-hidden"
      style={{ backgroundColor: 'var(--hero-grey)' }}
    >
      {/* The page still needs one real heading even while the visible line is
          empty, so it lives here for search and screen readers. */}
      <h1 className="sr-only">Abishai Gosula</h1>

      {/* ─── HERO LINE SLOT ───────────────────────────────────────────────────
          Intentionally empty. The line is a later decision. Drop the copy in
          here and it lands top-left over the figure, in near-black ink, with
          the layout and the figure sizing below already accounting for it.
          Nothing else needs to change.
          ──────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-[1600px] px-6 pt-24 text-ink md:px-10 md:pt-28"
      />

      <div ref={drift} className="relative z-10 flex w-full justify-center">
        {/* Sized by HEIGHT, not width. The crop is tight to the subject, so the
            top of this box is the top of his hair: it lands exactly
            --hero-top-gap from the top of the viewport, just under the nav.
            The figure is ~square, so on a phone it is wider than the screen and
            the section's overflow-hidden crops the shoulders. That is the trade:
            head under the nav beats seeing the full shoulder line. */}
        <div className="h-[calc(100svh-var(--hero-top-gap))]">
          <picture>
            <source
              type="image/avif"
              sizes="(min-width: 768px) 900px, 800px"
              srcSet="/assets/img/portrait-900.avif 900w, /assets/img/portrait-1800.avif 1800w"
            />
            <source
              type="image/webp"
              sizes="(min-width: 768px) 900px, 800px"
              srcSet="/assets/img/portrait-900.webp 900w, /assets/img/portrait-1800.webp 1800w"
            />
            <img
              ref={figure}
              src="/assets/img/portrait-900.png"
              width={1889}
              height={1913}
              fetchPriority="high"
              decoding="async"
              alt="Abishai Gosula"
              className="hero-rise block h-full w-auto max-w-none select-none"
            />
          </picture>
        </div>
      </div>
    </section>
  )
}
