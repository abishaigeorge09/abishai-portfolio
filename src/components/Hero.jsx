// Hero - type behind a cut-out figure, on one flat grey. Nothing else.
//
// "ABISHAI" / "GOSULA" sit giant and low-contrast directly behind the
// portrait, straddling the head (first line behind the forehead, second
// behind the chest) so the face reads as sitting between the two words. The
// portrait itself keeps its real alpha channel standing on var(--hero-grey).
// Do not put a gradient back behind either layer.
//
// It is built to be covered. Home.jsx pins this section (`sticky top-0 z-0`)
// and floats the cream sheet up over it, so the scroll tween below eases the
// figure down and scatters the name as the sheet climbs. The two read as one
// gesture rather than two things moving at once.
//
// Heights are svh, never vh. `100vh` is the viewport with the mobile browser
// chrome hidden, so at first paint anything centred against it sits too low and
// only settles once you scroll. That was the "not centered till a certain
// scroll" bug.
import { useEffect, useRef } from 'react'
import { gsap, SplitText, prefersReducedMotion } from '../lib/gsap'
import { useIsTouch } from '../lib/useIsTouch'
import { LiquidPortrait } from './LiquidPortrait'

// Deterministic pseudo-random in [0, 1), seeded by index (+ a salt per axis)
// so the scatter is stable across renders/scroll frames instead of
// re-rolling every time Math.random() would be called.
function seeded(i, salt) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

export function Hero() {
  const section = useRef(null)
  const drift = useRef(null) // cursor parallax lives here
  const figure = useRef(null) // reveal + scroll tweens live here
  const line1 = useRef(null)
  const line2 = useRef(null)
  const isTouch = useIsTouch()

  useEffect(() => {
    const sec = section.current
    const fig = figure.current
    if (!sec || !fig || prefersReducedMotion()) return

    // Type-behind char rise on load, same shape as the About hero: split
    // both lines together so the stagger reads as one continuous wave.
    const split = new SplitText([line1.current, line2.current], { type: 'chars' })
    gsap.set(split.chars, { yPercent: 120 })
    const rise = gsap.to(split.chars, {
      yPercent: 0,
      duration: 0.9,
      ease: 'back.out(1.5)',
      stagger: 0.025,
      delay: 0.2,
    })

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
        gsap
          .timeline({
            scrollTrigger: { start: 0, end: () => window.innerHeight * 0.9, scrub: 0.6 },
          })
          .to(fig, { yPercent: 10, scale: 0.92, ease: 'none' }, 0)
          .to(
            split.chars,
            {
              x: (i) => (seeded(i, 1) - 0.5) * 140,
              y: (i) => (seeded(i, 2) - 0.5) * 90,
              rotate: (i) => (seeded(i, 3) - 0.5) * 36,
              ease: 'none',
            },
            0
          )
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
      rise.kill()
      ctx?.revert()
      split.revert()
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
      {/* The page still needs one real heading even while the visible name is
          decorative type-behind, so it lives here for search and screen
          readers. */}
      <h1 className="sr-only">Abishai Gosula</h1>

      {/* Kicker: small, muted, top-left, ahead of everything else. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-[1600px] px-6 pt-24 md:px-10 md:pt-28">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-ink/70">
          Founder. Builder. 20.
        </p>
        <p className="mt-1 font-body text-xs uppercase tracking-[0.15em] text-ink/40">
          Products shipped, teams led, still a student.
        </p>
      </div>

      {/* Type-behind name: giant, low-contrast, straddling the head. Sits
          BELOW the portrait (no z-index vs. the z-10 drift wrapper below it
          in paint order) so the figure reads as standing in front of it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          ref={line1}
          className="absolute left-1/2 top-[19%] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-giant font-bold uppercase leading-none tracking-tight text-ink/90"
        >
          Abishai
        </div>
        <div
          ref={line2}
          className="absolute left-1/2 top-[63%] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-giant font-bold uppercase leading-none tracking-tight text-ink/90"
        >
          Gosula
          <span className="ml-3 inline-block h-[0.12em] w-[0.12em] -translate-y-[0.55em] rounded-full bg-blue align-baseline md:ml-5" />
        </div>
      </div>

      <div ref={drift} className="relative z-10 flex w-full justify-center">
        {/* Sized by HEIGHT, not width. The crop is tight to the subject, so the
            top of this box is the top of his hair: it lands exactly
            --hero-top-gap from the top of the viewport, just under the nav.
            The figure is ~square, so at full height on a phone it would be far
            wider than the screen and swallow the name. Phones get a shorter,
            bottom-anchored figure so the type-behind stays legible; from md up
            the head rides just under the nav at full height. */}
        <div className="h-[62svh] md:h-[calc(100svh-var(--hero-top-gap))]">
          <LiquidPortrait
            ref={figure}
            src="/assets/img/portrait-1800.webp"
            className="hero-rise block h-full w-auto max-w-none select-none"
          />
        </div>
      </div>

      {/* Scroll cue, bottom-centre, faded away by the cream sheet lifting
          over it a moment after paint. Decorative only, hence aria-hidden. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ink/45"
      >
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-ink/30" />
      </div>
    </section>
  )
}
