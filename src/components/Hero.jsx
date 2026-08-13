// Hero - pixel-faithful mechanics replica of s0animation.com/design's hero
// screen, restyled for this site: pure white ground, a giant Anton headline
// arched like a shallow rainbow whose word TYPES/deletes in a cycle, a
// continuously rotating 3D "screen wheel" of grayscale cards behind the
// avatar, the avatar centered in front with a soft idle float, and two
// typewriter kickers flanking mid-height. The EXPLORE pill lives in the
// scrolling sheet now (see ExplorePill.jsx, rendered from Home.jsx) — it is
// no longer part of this pinned section.
//
// It is built to be covered. Home.jsx pins this section (`sticky top-0 z-0`)
// and floats the cream sheet up over it, so the scroll-scrub below eases
// everything apart (headline lifts + fades, the wheel layer fades + blurs,
// avatar scales down and fades, kickers slide off) as the sheet climbs.
// Heights are svh, never vh, for the same reason as before: `100vh` includes
// the mobile browser chrome and reflows the composition on first paint.
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useIsTouch } from '../lib/useIsTouch'
import { heroCards } from '../data/heroCards'

const WORDS = ['FOUNDER', 'BUILDER', 'ENGINEER']

// ---------------------------------------------------------------------------
// Arched, typewriter-cycling headline
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

const ARC_CFG = {
  mobile: { amp: 18, rot: 6, scaleAmp: 0.05, skewAmp: 2 },
  desktop: { amp: 52, rot: 11, scaleAmp: 0.08, skewAmp: 4 },
}

// word cycle timing (ms)
const TYPE_MS = 55
const DELETE_MS = 30
const BLINK_MS = 820
const HOLD_MS = 2450
const GAP_MS = 150

function TypewriterArcWord({ mobile, onFirstWordDone }) {
  const [wordIdx, setWordIdx] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [phase, setPhase] = useState('typing') // typing -> blink -> hold -> deleting -> typing
  const reduced = prefersReducedMotion()
  const timerRef = useRef(null)
  const firstDoneRef = useRef(false)
  const rootRef = useRef(null)

  // Reduced motion: static word, no typing/deleting at all.
  useEffect(() => {
    if (!reduced) return
    setCharCount(WORDS[0].length)
    if (!firstDoneRef.current) {
      firstDoneRef.current = true
      onFirstWordDone?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const word = WORDS[wordIdx]
    clearTimeout(timerRef.current)
    if (phase === 'typing') {
      if (charCount < word.length) {
        timerRef.current = setTimeout(() => setCharCount((c) => c + 1), TYPE_MS)
      } else {
        if (!firstDoneRef.current) {
          firstDoneRef.current = true
          onFirstWordDone?.()
        }
        timerRef.current = setTimeout(() => setPhase('blink'), 60)
      }
    } else if (phase === 'blink') {
      timerRef.current = setTimeout(() => setPhase('hold'), BLINK_MS)
    } else if (phase === 'hold') {
      timerRef.current = setTimeout(() => setPhase('deleting'), HOLD_MS)
    } else if (phase === 'deleting') {
      if (charCount > 0) {
        timerRef.current = setTimeout(() => setCharCount((c) => c - 1), DELETE_MS)
      } else {
        timerRef.current = setTimeout(() => {
          setWordIdx((i) => (i + 1) % WORDS.length)
          setPhase('typing')
        }, GAP_MS)
      }
    }
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, charCount, wordIdx, reduced])

  const word = WORDS[wordIdx]
  const n = word.length
  const cfg = mobile ? ARC_CFG.mobile : ARC_CFG.desktop
  const shown = word.slice(0, charCount).split('')

  const caretClass = phase === 'blink' ? 'caret-blink-twice' : phase === 'typing' ? 'caret-blink' : 'opacity-0'
  const caretT = n > 1 ? charCount / (n - 1) - 0.5 : 0
  const caret = arcTransform(caretT, cfg)

  return (
    <span ref={rootRef} className="relative block" style={{ perspective: 600 }}>
      <span className="flex justify-center leading-none">
        {shown.map((ch, i) => {
          const t = n > 1 ? i / (n - 1) - 0.5 : 0
          const { y, rotate, scale, skew } = arcTransform(t, cfg)
          return (
            <span
              key={`${wordIdx}-${i}`}
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
              <span className="glyph letter-pop inline-block">{ch}</span>
            </span>
          )
        })}
        {/* blinking block caret, arc-positioned right after the last typed letter */}
        {!reduced && (
          <span
            aria-hidden="true"
            className={`arc-glyph inline-block ${caretClass}`}
            style={{
              width: '0.46em',
              height: '0.74em',
              marginLeft: '0.03em',
              background: '#111',
              transform: `translateY(${caret.y}px) rotate(${caret.rotate}deg) scale(${caret.scale})`,
              transformOrigin: 'center bottom',
            }}
          />
        )}
      </span>
      {/* invisible spacer keeps the tallest word's box height reserved so the
          headline never reflows as letters are typed/deleted */}
      <span aria-hidden="true" className="invisible block">
        {WORDS.reduce((a, b) => (a.length > b.length ? a : b))}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Typewriter kickers ("Founder & CS Student" / "Ships End to End")
// ---------------------------------------------------------------------------

function useTypewriter(text, charMs, start) {
  const [count, setCount] = useState(0)
  const timerRef = useRef(null)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    if (reduced) {
      setCount(text.length)
      return
    }
    if (!start || count >= text.length) return
    timerRef.current = setTimeout(() => setCount((c) => c + 1), charMs)
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, count, text, charMs, reduced])

  return { shown: text.slice(0, count), done: count >= text.length, reduced }
}

function TypedKicker({ text, start, className = '' }) {
  const { shown, done, reduced } = useTypewriter(text, 28, start)
  return (
    <span className={className}>
      {shown}
      {!reduced && (
        <span
          aria-hidden="true"
          className={`ml-[2px] inline-block h-[0.85em] w-[1.5px] -translate-y-[1px] bg-ink align-middle transition-opacity duration-500 ${
            done ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Screen wheel — portrait phone cards on a ring AROUND the viewer, like the
// reference's three.js carousel: the straight-ahead card sits far away and in
// focus at screen center; cards at larger angles swing toward the screen
// edges, grow (they are nearer the camera) and defocus. Auto-spins slowly and
// can be grabbed and thrown with the pointer.
// ---------------------------------------------------------------------------

const CARD_COUNT = 10
const STEP = 360 / CARD_COUNT
const SPIN_DEG_PER_SEC = 6

const ScreenWheel = forwardRef(function ScreenWheel({ mobile, isTouch, phaseRef, speedRef }, wheelRef) {
  const cardRefs = useRef([])
  const contentRefs = useRef([])
  const hoverIndexRef = useRef(-1)
  const lastTimeRef = useRef(null)
  const reduced = prefersReducedMotion()
  const R = mobile ? 430 : 760
  const P = mobile ? 700 : 1000

  const applyFrame = (phase, hoverIdx) => {
    for (let i = 0; i < CARD_COUNT; i++) {
      const el = cardRefs.current[i]
      const inner = contentRefs.current[i]
      if (!el || !inner) continue
      const a = ((i * STEP + phase) % 360 + 360) % 360
      const rad = (a * Math.PI) / 180
      const d = Math.cos(rad) // 1 = straight ahead (far, in focus); <0 = beside/behind camera
      const hovered = i === hoverIdx
      // ring around the viewer: rotate, push away, then billboard the face
      el.style.transform = `translate(-50%, -50%) rotateY(${a}deg) translateZ(${-R}px) rotateY(${-a}deg)`
      // hide only once the card is well beside/behind the camera; the last
      // pair before that renders huge and defocused at the screen edges,
      // exactly like the reference's out-of-focus foreground phones
      const vis = d > -0.45
      const blur = Math.min(11, Math.max(0, (1 - d) * 5.5))
      inner.style.opacity = vis ? String(Math.min(1, 0.55 + 0.45 * d) * (hovered ? 1 : 1)) : '0'
      inner.style.filter = hovered ? 'none' : blur > 0.4 ? `blur(${blur}px)` : 'none'
      inner.style.transform = hovered ? 'scale(1.03)' : 'scale(1)'
      el.style.zIndex = String(Math.round((1 - d) * 50)) // nearer (low d) stacks on top
      el.style.pointerEvents = vis ? 'auto' : 'none'
    }
  }

  useEffect(() => {
    if (reduced) {
      applyFrame(0, -1)
      return
    }
    lastTimeRef.current = null
    const tick = (time) => {
      // gsap.ticker's `time` argument is already elapsed seconds (not ms).
      if (lastTimeRef.current == null) lastTimeRef.current = time
      const dt = Math.min(0.1, time - lastTimeRef.current)
      lastTimeRef.current = time
      // speedRef.current carries drag velocity; it eases back to the idle spin
      const idle = hoverIndexRef.current >= 0 ? SPIN_DEG_PER_SEC * 0.25 : SPIN_DEG_PER_SEC
      speedRef.current += (idle - speedRef.current) * Math.min(1, dt * 1.6)
      phaseRef.current = (phaseRef.current + speedRef.current * dt) % 360
      applyFrame(phaseRef.current, hoverIndexRef.current)
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, mobile])

  return (
    <div
      ref={wheelRef}
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      style={{ perspective: `${P}px`, top: '-7%' }}
    >
      <div className="relative h-0 w-0" style={{ transformStyle: 'preserve-3d' }}>
        {heroCards.map((card, i) => (
          <div
            key={i}
            ref={(el) => (cardRefs.current[i] = el)}
            className="absolute left-1/2 top-1/2 will-change-transform"
            onMouseEnter={isTouch ? undefined : () => (hoverIndexRef.current = i)}
            onMouseLeave={isTouch ? undefined : () => {
              if (hoverIndexRef.current === i) hoverIndexRef.current = -1
            }}
          >
            {/* portrait phone card, like the reference gallery */}
            <div
              ref={(el) => (contentRefs.current[i] = el)}
              className="h-[440px] w-[232px] overflow-hidden rounded-[26px] border border-ink/10 bg-white shadow-[0_30px_70px_-38px_rgba(17,17,17,0.35)] will-change-transform md:h-[690px] md:w-[364px] md:rounded-[38px]"
            >
              <img src={card.src} alt={card.alt} className="h-full w-full grayscale object-cover" draggable={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export function Hero() {
  const section = useRef(null)
  const headlineWrap = useRef(null)
  const wheelRef = useRef(null)
  const wheelDrift = useRef(null)
  const avatarScrub = useRef(null)
  const avatarFloat = useRef(null)
  const kickerLeft = useRef(null)
  const kickerRight = useRef(null)
  const isTouch = useIsTouch()
  const [mobile, setMobile] = useState(false)
  const [firstWordDone, setFirstWordDone] = useState(false)
  // wheel phase/velocity live here so pointer-drag on the whole section can
  // spin the carousel (reference behavior: grab anywhere and throw the wheel)
  const wheelPhase = useRef(0)
  const wheelSpeed = useRef(SPIN_DEG_PER_SEC)

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

  // Drag-to-rotate: grab anywhere on the hero and throw the wheel. Horizontal
  // pointer movement maps to wheel phase; release keeps the fling velocity,
  // which the wheel's ticker then eases back to the idle spin.
  useEffect(() => {
    const sec = section.current
    if (!sec || prefersReducedMotion()) return
    let dragging = false
    let lastX = 0
    let lastT = 0
    const DEG_PER_PX = 0.14
    const down = (e) => {
      dragging = true
      lastX = e.clientX
      lastT = performance.now()
      sec.style.cursor = 'grabbing'
    }
    const move = (e) => {
      if (!dragging) return
      const now = performance.now()
      const dx = e.clientX - lastX
      const dt = Math.max(1, now - lastT)
      wheelPhase.current = (wheelPhase.current + dx * DEG_PER_PX) % 360
      wheelSpeed.current = (dx * DEG_PER_PX * 1000) / dt
      lastX = e.clientX
      lastT = now
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      sec.style.cursor = 'grab'
      // clamp fling velocity so a hard throw stays controllable
      wheelSpeed.current = Math.max(-260, Math.min(260, wheelSpeed.current))
    }
    sec.style.cursor = 'grab'
    sec.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    return () => {
      sec.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  // Cursor parallax on the wheel layer.
  useEffect(() => {
    const sec = section.current
    const el = wheelDrift.current
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
  // specific targets) because the headline's letters are typed/deleted live —
  // a live query keeps the scrub correct no matter how many are mounted.
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

        // wheel: fades + blurs as a whole layer (the wheel itself keeps
        // spinning every frame via its own ticker, so per-card transforms are
        // never fought over)
        if (wheelRef.current) {
          wheelRef.current.style.opacity = String(1 - p)
          wheelRef.current.style.filter = p > 0.01 ? `blur(${p * 8}px)` : 'none'
        }

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
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section
      ref={section}
      className="relative flex min-h-[100svh] w-full flex-col items-center overflow-hidden bg-white"
    >
      {/* Real heading for search + screen readers; every visible headline span
          below is decorative. */}
      <h1 className="sr-only">Abishai Gosula</h1>

      {/* 2. screen wheel — 10-card 3D carousel, deepest layer */}
      <div ref={wheelDrift} className="absolute inset-0 z-0">
        <ScreenWheel
          ref={wheelRef}
          mobile={mobile}
          isTouch={isTouch}
          phaseRef={wheelPhase}
          speedRef={wheelSpeed}
        />
      </div>

      {/* 1. arched, typewriter-cycling headline — above the wheel, behind the
          avatar (the reference character's head overlaps the title) */}
      <div
        ref={headlineWrap}
        aria-hidden="true"
        className="pointer-events-none relative z-10 mx-auto mt-24 w-full max-w-[1500px] px-4 text-center md:mt-[88px]"
      >
        <div
          className="mx-auto font-anton uppercase text-[#111]"
          style={{
            fontSize: mobile ? 'clamp(2.5rem, 15.5vw, 4.25rem)' : 'clamp(5.5rem, 10.4vw, 10.5rem)',
            letterSpacing: '-0.01em',
          }}
        >
          <TypewriterArcWord mobile={mobile} onFirstWordDone={() => setFirstWordDone(true)} />
        </div>
      </div>

      {/* 3. avatar, front of everything, head overlapping the title */}
      <div
        ref={avatarScrub}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-36 md:pb-[9svh]"
      >
        <div ref={avatarFloat} className="relative flex h-[42svh] items-end md:h-[73svh]">
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

      {/* 4. angled, typewriter kickers flanking the avatar, mid-height */}
      <p
        ref={kickerLeft}
        className="pointer-events-none absolute left-[6%] top-[34%] z-20 max-w-[8rem] rotate-[-4deg] text-[12px] font-extrabold uppercase tracking-[0.1em] text-ink md:left-[17.5%] md:top-[69.5%] md:max-w-none md:text-[19px]"
        style={{ fontFamily: "'Montserrat', 'Fredoka', sans-serif" }}
      >
        <TypedKicker text="Founder & CS Student" start={firstWordDone} />
      </p>
      <p
        ref={kickerRight}
        className="pointer-events-none absolute right-[6%] top-[38%] z-20 max-w-[8rem] rotate-[4deg] text-right text-[12px] font-extrabold uppercase tracking-[0.1em] text-ink md:right-[21.5%] md:top-[68%] md:max-w-none md:text-[19px]"
        style={{ fontFamily: "'Montserrat', 'Fredoka', sans-serif" }}
      >
        <TypedKicker text="Ships End to End" start={firstWordDone} />
      </p>
    </section>
  )
}
