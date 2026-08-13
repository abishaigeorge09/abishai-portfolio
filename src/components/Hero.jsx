// Hero - faithful replica of s0animation.com/design's hero screen, restyled
// for this site: pure white ground, a giant Anton headline arched like a
// shallow rainbow that CYCLES role words, a ghost-frame arc of empty
// "product shot" cards behind the avatar, the avatar centered in front with
// a soft idle float, two angled kickers flanking mid-height, and a black
// tombstone "EXPLORE" pill anchored to the fold.
//
// It is built to be covered. Home.jsx pins this section (`sticky top-0 z-0`)
// and floats the cream sheet up over it, so the scroll-scrub below eases
// everything apart (headline lifts + fades, cards scatter outward, avatar
// scales down and fades, kickers slide off, pill stretches away) as the
// sheet climbs. Heights are svh, never vh, for the same reason as before:
// `100vh` includes the mobile browser chrome and reflows the composition on
// first paint.
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useIsTouch } from '../lib/useIsTouch'
import { heroCards } from '../data/heroCards'

const WORDS = ['FOUNDER', 'BUILDER', 'ENGINEER']

// ---------------------------------------------------------------------------
// Arched headline
// ---------------------------------------------------------------------------

// Per-letter transform along a shallow "rainbow" arc: t runs -0.5 (first
// letter) to +0.5 (last letter). Center letters ride highest and largest;
// the ends dip down, rotate outward and skew toward the arc normal.
function arcTransform(t, { amp, rot, scaleAmp, skewAmp }) {
  const y = amp * (4 * t * t - 0.4)
  const rotate = rot * t * 2
  const scale = 1 + scaleAmp * (1 - 4 * t * t)
  const skew = skewAmp * t
  return { y, rotate, scale, skew }
}

const ArcWord = forwardRef(function ArcWord({ word, mobile, className }, ref) {
  const letters = word.split('')
  const n = letters.length
  const cfg = mobile
    ? { amp: 12, rot: 7, scaleAmp: 0.04, skewAmp: 1.5 }
    : { amp: 30, rot: 15, scaleAmp: 0.1, skewAmp: 3.5 }

  return (
    <span ref={ref} className={`flex justify-center leading-none ${className || ''}`}>
      {letters.map((ch, i) => {
        const t = n > 1 ? i / (n - 1) - 0.5 : 0
        const { y, rotate, scale, skew } = arcTransform(t, cfg)
        return (
          <span
            key={i}
            className="arc-glyph inline-block will-change-transform"
            style={{
              '--ay': `${y}px`,
              '--arot': `${rotate}deg`,
              '--askew': `${skew}deg`,
              '--ascale': scale,
              '--sy': '0px',
              '--srot': '0deg',
              '--sop': 1,
              transform:
                'translateY(calc(var(--ay) + var(--sy))) rotate(calc(var(--arot) + var(--srot))) skewX(var(--askew)) scale(var(--ascale))',
              opacity: 'var(--sop)',
              transformOrigin: 'center bottom',
            }}
          >
            <span className="glyph inline-block">{ch}</span>
          </span>
        )
      })}
    </span>
  )
})

function CyclingArcWord({ mobile }) {
  const [active, setActive] = useState(0)
  const [prev, setPrev] = useState(null)
  const activeRef = useRef(0)
  const activeWordRef = useRef(null)
  const prevWordRef = useRef(null)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => {
      const cur = activeRef.current
      setPrev(cur)
      setActive((cur + 1) % WORDS.length)
    }, 4000)
    return () => clearInterval(id)
  }, [reduced])

  // Entrance: roll the new word's letters up into place.
  useLayoutEffect(() => {
    if (reduced || !activeWordRef.current) return
    const letters = activeWordRef.current.querySelectorAll('.glyph')
    gsap.fromTo(
      letters,
      { yPercent: 130, opacity: 0, rotateX: 50 },
      { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.55, ease: 'back.out(1.6)', stagger: 0.03 }
    )
  }, [active, reduced])

  // Exit: roll the old word's letters out, then unmount it.
  useLayoutEffect(() => {
    if (prev === null) return
    if (reduced) {
      setPrev(null)
      return
    }
    const node = prevWordRef.current
    if (!node) {
      setPrev(null)
      return
    }
    const letters = node.querySelectorAll('.glyph')
    gsap.to(letters, {
      yPercent: -130,
      opacity: 0,
      rotateX: -50,
      duration: 0.4,
      ease: 'power2.in',
      stagger: 0.02,
      onComplete: () => setPrev(null),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev])

  return (
    <span className="relative block" style={{ perspective: 600 }}>
      {prev !== null && (
        <ArcWord ref={prevWordRef} word={WORDS[prev]} mobile={mobile} className="absolute inset-0" />
      )}
      <ArcWord
        ref={activeWordRef}
        word={WORDS[active]}
        mobile={mobile}
        className={prev !== null ? 'absolute inset-0' : 'relative'}
      />
      {/* invisible spacer keeps the tallest word's box height reserved so the
          absolutely-positioned words never collapse the layout */}
      <span aria-hidden="true" className="invisible block">
        {WORDS.reduce((a, b) => (a.length > b.length ? a : b))}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Ghost frame arc
// ---------------------------------------------------------------------------

// pairIndex 0 = the two cards nearest center, 2 = the outermost pair.
const PAIR_CONFIG = [
  { rotateY: 8, blur: 0, opacity: 1, scale: 1, x: 190 },
  { rotateY: 18, blur: 2, opacity: 0.7, scale: 0.9, x: 440 },
  { rotateY: 28, blur: 6, opacity: 0.45, scale: 0.8, x: 660 },
]
const PAIR_CONFIG_MOBILE = [{ rotateY: 6, blur: 0, opacity: 1, scale: 1, x: 108 }]

function GhostCards({ mobile, cardsRef }) {
  const order = mobile
    ? [2] // center-left, center-right only — "only the center 3 render" (avatar sits between them)
    : [0, 1, 2]
  const pairs = mobile ? PAIR_CONFIG_MOBILE : PAIR_CONFIG
  // Build left/right slots for each pair we're rendering, outer to inner so
  // DOM order stays visually stackable.
  const slots = []
  const usedPairs = mobile ? [0] : [2, 1, 0]
  usedPairs.forEach((pairIdx) => {
    slots.push({ side: -1, pairIdx })
    slots.push({ side: 1, pairIdx })
  })

  return (
    <div
      ref={cardsRef}
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      style={{ perspective: 1200 }}
    >
      {slots.map(({ side, pairIdx }, i) => {
        const cfg = pairs[pairIdx]
        const card = heroCards[i % heroCards.length]
        return (
          <div
            key={i}
            data-side={side}
            data-base-x={side * cfg.x}
            data-base-rot={side * cfg.rotateY}
            data-base-scale={cfg.scale}
            data-base-blur={cfg.blur}
            data-base-opacity={cfg.opacity}
            className="absolute h-[144px] w-[230px] overflow-hidden rounded-[14px] border border-ink/10 bg-[#fafafa] shadow-[0_18px_40px_-24px_rgba(17,17,17,0.25)] md:h-[175px] md:w-[280px]"
            style={{
              transform: `translateX(${side * cfg.x}px) rotateY(${side * cfg.rotateY}deg) scale(${cfg.scale})`,
              filter: cfg.blur ? `blur(${cfg.blur}px)` : 'none',
              opacity: cfg.opacity,
            }}
          >
            {/* faint browser-chrome strip */}
            <div className="flex h-6 items-center gap-1.5 border-b border-ink/10 bg-ink/[0.03] px-3">
              <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />
            </div>
            {card.src ? (
              <img src={card.src} alt={card.alt} className="h-[calc(100%-1.5rem)] w-full grayscale object-cover" />
            ) : (
              <div className="flex h-[calc(100%-1.5rem)] w-full items-center justify-center">
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.25em] text-ink/30">
                  Soon
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export function Hero() {
  const section = useRef(null)
  const headlineWrap = useRef(null)
  const cardsRef = useRef(null)
  const cardsDrift = useRef(null)
  const avatarScrub = useRef(null)
  const avatarFloat = useRef(null)
  const kickerLeft = useRef(null)
  const kickerRight = useRef(null)
  const pillRef = useRef(null)
  const isTouch = useIsTouch()
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const measure = () => setMobile(window.innerWidth < 768)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Load-in: avatar rises/fades after the headline settles, kickers rise
  // shortly after that.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const tl = gsap.timeline({ delay: 0.5 })
    if (avatarScrub.current) {
      gsap.set(avatarScrub.current, { opacity: 0, y: 26 })
      tl.to(avatarScrub.current, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0)
    }
    ;[kickerLeft.current, kickerRight.current].forEach((el, i) => {
      if (!el) return
      gsap.set(el, { opacity: 0, y: 12 })
      tl.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.25 + i * 0.08)
    })
    return () => tl.kill()
  }, [])

  // Idle float on the avatar image itself, independent of the scroll-scrub
  // wrapper so the two transforms never fight.
  useEffect(() => {
    if (prefersReducedMotion() || !avatarFloat.current) return
    const tl = gsap
      .timeline({ repeat: -1, yoyo: true })
      .to(avatarFloat.current, { y: -5, rotate: 0.4, duration: 2.25, ease: 'sine.inOut' })
    return () => tl.kill()
  }, [])

  // Cursor parallax on the ghost-card arc.
  useEffect(() => {
    const sec = section.current
    const el = cardsDrift.current
    if (!sec || !el || isTouch || prefersReducedMotion()) return
    const xTo = gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' })
    let raf = 0
    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const r = sec.getBoundingClientRect()
        xTo(((e.clientX - r.left) / r.width - 0.5) * -14)
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

  // The pull: scroll-scrub choreography over the hero's pin span. Reads/writes
  // the DOM directly on each tick (rather than a GSAP timeline bound to
  // specific targets) because the headline's letters are swapped out every 4s
  // by the word-cycle above — a live query keeps the scrub correct no matter
  // which word is currently mounted.
  useEffect(() => {
    const sec = section.current
    if (!sec || prefersReducedMotion()) return

    const trigger = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: () => window.innerHeight,
      scrub: 0.5,
      onUpdate(self) {
        const p = self.progress

        // headline: per-letter lift + rotate + fade, staggered left to right
        const glyphs = headlineWrap.current ? headlineWrap.current.querySelectorAll('.arc-glyph') : []
        const n = glyphs.length
        glyphs.forEach((el, i) => {
          const stagger = n > 1 ? i / (n - 1) : 0
          const local = gsap.utils.clamp(0, 1, (p - stagger * 0.25) / 0.75)
          el.style.setProperty('--sy', `${-local * 90}px`)
          el.style.setProperty('--srot', `${-local * 10}deg`)
          el.style.setProperty('--sop', String(1 - local))
        })

        // cards: scatter outward along the arc, gaining blur, losing opacity
        const cards = cardsRef.current ? cardsRef.current.children : []
        Array.from(cards).forEach((el) => {
          const side = Number(el.dataset.side)
          const baseX = Number(el.dataset.baseX)
          const baseRot = Number(el.dataset.baseRot)
          const baseScale = Number(el.dataset.baseScale)
          const baseBlur = Number(el.dataset.baseBlur)
          const baseOpacity = Number(el.dataset.baseOpacity)
          const x = baseX + side * p * 160
          const rot = baseRot + side * p * 24
          el.style.transform = `translateX(${x}px) rotateY(${rot}deg) scale(${baseScale})`
          el.style.filter = `blur(${baseBlur + p * 8}px)`
          el.style.opacity = String(Math.max(0, baseOpacity * (1 - p)))
        })

        // avatar: settle down and away
        if (avatarScrub.current) {
          avatarScrub.current.style.transform = `translateY(${p * 46}px) scale(${1 - p * 0.08})`
          avatarScrub.current.style.opacity = String(1 - p)
        }

        // kickers: slide out to their respective sides
        if (kickerLeft.current) {
          kickerLeft.current.style.transform = `translateX(${-p * 140}px) rotate(-4deg)`
          kickerLeft.current.style.opacity = String(1 - p)
        }
        if (kickerRight.current) {
          kickerRight.current.style.transform = `translateX(${p * 140}px) rotate(4deg)`
          kickerRight.current.style.opacity = String(1 - p)
        }

        // pill: stretch tall then fade
        if (pillRef.current) {
          pillRef.current.style.transform = `translateX(-50%) scaleY(${1 + p * 0.15})`
          pillRef.current.style.opacity = String(1 - p * 1.2)
        }
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
    <section
      ref={section}
      className="relative flex min-h-[100svh] w-full flex-col items-center overflow-hidden bg-white"
    >
      {/* Real heading for search + screen readers; every visible headline span
          below is decorative. */}
      <h1 className="sr-only">Abishai Gosula</h1>

      {/* 1. arched, cycling headline */}
      <div
        ref={headlineWrap}
        aria-hidden="true"
        className="pointer-events-none relative z-30 mx-auto mt-24 w-full max-w-[1400px] px-4 text-center md:mt-28"
      >
        <div
          className="mx-auto font-anton uppercase text-[#111]"
          style={{ fontSize: mobile ? 'clamp(2.5rem, 15.5vw, 4.25rem)' : 'clamp(4.5rem, 8.6vw, 10rem)' }}
        >
          <CyclingArcWord mobile={mobile} />
        </div>
      </div>

      {/* 2. ghost-frame card arc, parallax-driven */}
      <div ref={cardsDrift} className="absolute inset-0 z-10">
        <GhostCards mobile={mobile} cardsRef={cardsRef} />
      </div>

      {/* 3. avatar, front and center */}
      <div
        ref={avatarScrub}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-24 md:pb-0"
      >
        <div ref={avatarFloat} className="relative flex h-[46svh] items-end md:h-[64svh]">
          {/* soft elliptical ground shadow under the shoes */}
          <div
            aria-hidden="true"
            className="absolute bottom-1 left-1/2 h-6 w-[46%] -translate-x-1/2 rounded-full md:h-9"
            style={{ background: 'radial-gradient(ellipse, rgba(17,17,17,0.28), rgba(17,17,17,0) 72%)' }}
          />
          <img
            src="/assets/img/avatar-anime.webp"
            alt=""
            className="relative block h-full w-auto select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 4. angled kickers flanking the avatar, mid-height */}
      <p
        ref={kickerLeft}
        className="pointer-events-none absolute left-[6%] top-[34%] z-20 max-w-[8rem] rotate-[-4deg] font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-ink md:left-[18%] md:top-[65%] md:max-w-none md:text-[15px]"
      >
        Founder &amp; CS Student
      </p>
      <p
        ref={kickerRight}
        className="pointer-events-none absolute right-[6%] top-[38%] z-20 max-w-[8rem] rotate-[4deg] text-right font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-ink md:right-[18%] md:top-[63%] md:max-w-none md:text-[15px]"
      >
        Ships End to End
      </p>

      {/* 5. explore pill + pull */}
      <button
        ref={pillRef}
        type="button"
        onClick={scrollToNext}
        aria-label="Explore"
        className="group absolute bottom-20 left-1/2 z-30 flex h-[76px] w-14 -translate-x-1/2 flex-col items-center justify-between rounded-t-full bg-ink pb-2.5 pt-3.5 text-cream transition-transform duration-300 ease-spring-pill hover:-translate-y-1 md:bottom-0 md:h-[86px] md:w-16 md:pb-3 md:pt-4"
      >
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.18em]">Explore</span>
        <span aria-hidden="true" className="text-sm leading-none animate-bounce">
          ↓
        </span>
      </button>
    </section>
  )
}
