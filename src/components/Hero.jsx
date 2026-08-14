// Hero - matched against the founder's screen recording of
// s0animation.com/design (frames in the session tmp dir). The mechanics that
// recording proves:
// - Horizontal card TRACK: perfectly still at idle; moves only from pointer
//   drag (fling + coast) or horizontal wheel/trackpad deltas; wraps
//   infinitely; uniform portrait cards on a ~255px pitch; the leaving pair
//   grows slightly and defocuses. COLOR cards on a white ground.
// - The rail BOWS with vertical cursor movement (cursor high/low bends the
//   curve up/down; each card tilts along the curve tangent).
// - Headline: cycling first word + constant second word, both on one gently
//   bowed Anton line; the swap is a per-letter pop; the character flashes a
//   solid brand-blue silhouette at the swap instant.
// - Scroll exit is a ZOOM: title and cards scale up and defocus as the sheet
//   arrives (not a lift-away).
// The load-in waits for the intro loader's `intro:done` event (3s fallback).
// Heights are svh, never vh (mobile browser chrome reflow).
import { forwardRef, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useIsTouch } from '../lib/useIsTouch'
import { heroCards } from '../data/heroCards'

const CYCLE_WORDS = ['PRODUCT', 'STARTUP', 'VENTURE']
const CONSTANT_WORD = 'BUILDER'
const WORD_MS = 4000

// ---------------------------------------------------------------------------
// Bowed two-word headline with per-letter pop swap on the first word
// ---------------------------------------------------------------------------

function arcTransform(t, mobile) {
  const amp = mobile ? 10 : 26
  const y = amp * (4 * t * t - 0.4)
  return { y, rotate: (mobile ? 5 : 7) * t * 2, skew: (mobile ? 1.5 : 3) * t }
}

function ArcGlyph({ ch, t, mobile, cyc, wordKey, idx }) {
  const { y, rotate, skew } = arcTransform(t, mobile)
  return (
    <span
      className="arc-glyph inline-block will-change-transform"
      style={{
        '--ay': `${y}px`,
        '--arot': `${rotate}deg`,
        '--askew': `${skew}deg`,
        '--sy': '0px',
        '--srot': '0deg',
        '--sop': 1,
        transform:
          'translateY(calc(var(--ay) + var(--sy))) rotate(calc(var(--arot) + var(--srot))) skewX(var(--askew))',
        opacity: 'var(--sop)',
        transformOrigin: 'center bottom',
      }}
    >
      <span
        className={`inline-block will-change-transform ${cyc ? 'glyph-cycling' : ''}`}
        data-key={cyc ? `${wordKey}-${idx}` : undefined}
      >
        {ch === ' ' ? ' ' : ch}
      </span>
    </span>
  )
}

function PopSwapHeadline({ mobile, onFirstWordDone, onSwap }) {
  const [wordIdx, setWordIdx] = useState(0)
  const rootRef = useRef(null)
  const reduced = prefersReducedMotion()
  const firstDoneRef = useRef(false)

  useEffect(() => {
    if (reduced) {
      if (!firstDoneRef.current) {
        firstDoneRef.current = true
        onFirstWordDone?.()
      }
      return
    }
    const id = setInterval(() => {
      onSwap?.()
      const glyphs = rootRef.current?.querySelectorAll('.glyph-cycling') || []
      gsap.to(glyphs, {
        yPercent: -55,
        opacity: 0,
        rotate: -6,
        duration: 0.2,
        ease: 'power2.in',
        stagger: 0.014,
        onComplete: () => setWordIdx((i) => (i + 1) % CYCLE_WORDS.length),
      })
    }, WORD_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const glyphs = rootRef.current?.querySelectorAll('.glyph-cycling') || []
    gsap.fromTo(
      glyphs,
      { scale: 1.55, opacity: 0, yPercent: 8 },
      {
        scale: 1,
        opacity: 1,
        yPercent: 0,
        duration: 0.42,
        ease: 'back.out(2.1)',
        stagger: 0.03,
        onComplete: () => {
          if (!firstDoneRef.current) {
            firstDoneRef.current = true
            onFirstWordDone?.()
          }
        },
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordIdx, reduced])

  const line = `${CYCLE_WORDS[wordIdx]} ${CONSTANT_WORD}`
  const n = line.length
  const cycLen = CYCLE_WORDS[wordIdx].length

  return (
    <span ref={rootRef} className="relative block">
      <span className="flex justify-center leading-none">
        {line.split('').map((ch, i) => (
          <ArcGlyph
            key={i < cycLen ? `c-${wordIdx}-${i}` : `k-${i - cycLen}`}
            ch={ch}
            t={n > 1 ? i / (n - 1) - 0.5 : 0}
            mobile={mobile}
            cyc={i < cycLen}
            wordKey={wordIdx}
            idx={i}
          />
        ))}
      </span>
      {/* reserve the widest line's box so swaps never reflow the page */}
      <span aria-hidden="true" className="invisible block leading-none">
        {CYCLE_WORDS.reduce((a, b) => (a.length > b.length ? a : b))} {CONSTANT_WORD}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Typewriter kickers (load-in only)
// ---------------------------------------------------------------------------

function useTypewriter(text, charMs, start) {
  const [count, setCount] = useState(0)
  const reduced = prefersReducedMotion()
  useEffect(() => {
    if (reduced) {
      setCount(text.length)
      return
    }
    if (!start || count >= text.length) return
    const id = setTimeout(() => setCount((c) => c + 1), charMs)
    return () => clearTimeout(id)
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
// Screen track — infinite horizontal card rail, input-driven, cursor-bowed
// ---------------------------------------------------------------------------

const PITCH_DESKTOP = 375
const PITCH_MOBILE = 230
const DRIFT_SPEED = 52 // px/s — the rail never stops (founder order: brisker)

// One rail card: black and white until CLICKED, then it reveals its color
// (a click is a press that barely moved, so dragging the rail never triggers it).
function CardFrame({ card, innerRef }) {
  const [colored, setColored] = useState(false)
  const pressRef = useRef(null)
  return (
    <div
      ref={innerRef}
      className="absolute left-1/2 top-1/2 h-[131px] w-[210px] cursor-pointer overflow-hidden rounded-[14px] border border-ink/10 bg-white shadow-[0_26px_60px_-34px_rgba(17,17,17,0.35)] will-change-transform md:h-[212px] md:w-[340px] md:rounded-[18px]"
      onPointerDown={(e) => (pressRef.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={(e) => {
        const p = pressRef.current
        if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 6) setColored((c) => !c)
        pressRef.current = null
      }}
    >
      <img
        src={card.src}
        alt={card.alt}
        className={`h-full w-full object-cover transition-[filter] duration-700 ${colored ? 'grayscale-0' : 'grayscale'}`}
        draggable={false}
      />
    </div>
  )
}

const ScreenTrack = forwardRef(function ScreenTrack(
  { mobile, offsetRef, velocityRef, bowRef },
  layerRef
) {
  const cardRefs = useRef([])
  const reduced = prefersReducedMotion()
  const pitch = mobile ? PITCH_MOBILE : PITCH_DESKTOP
  const loop = heroCards.length * pitch

  const applyFrame = (offset, bow) => {
    const half = loop / 2
    const halfW = mobile ? 195 : 800
    for (let i = 0; i < heroCards.length; i++) {
      const el = cardRefs.current[i]
      if (!el) continue
      let dx = (i * pitch + offset) % loop
      if (dx > half) dx -= loop
      if (dx < -half) dx += loop
      const ax = Math.abs(dx)
      const grow = Math.max(0, (ax - (mobile ? 250 : 520)) / (mobile ? 210 : 420))
      const scale = 1 + Math.min(0.22, grow * 0.22)
      const blur = Math.min(9, Math.max(0, (ax - (mobile ? 210 : 420)) / (mobile ? 190 : 380)) * 9)
      const fade = Math.max(0, (ax - (mobile ? 400 : 900)) / (mobile ? 150 : 260))
      // permanent ARCH (the reference fan), deepened/flattened by cursor Y:
      // cards ride the parabola and tilt along its tangent
      const u = dx / halfW
      const bowY = bow * u * u * 90
      const bowRot = bow * u * 8
      el.style.transform = `translate(-50%, -50%) translate(${dx}px, ${bowY}px) rotate(${bowRot}deg) scale(${scale})`
      el.style.filter = blur > 0.4 ? `blur(${blur}px)` : 'none'
      el.style.opacity = String(Math.max(0, 1 - fade))
      el.style.zIndex = String(100 + Math.round(grow * 50))
    }
  }

  useEffect(() => {
    applyFrame(offsetRef.current, 1)
    if (reduced) return
    const tick = (time, dtMs) => {
      const dt = Math.min(0.1, dtMs / 1000)
      // input velocity coasts out, but the rail itself NEVER stops: a slow
      // constant drift keeps it alive underneath drag/wheel input
      velocityRef.current *= Math.exp(-4.2 * dt)
      if (Math.abs(velocityRef.current) < 0.5) velocityRef.current = 0
      offsetRef.current += (DRIFT_SPEED + velocityRef.current) * dt
      applyFrame(offsetRef.current, bowRef.current)
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, mobile])

  return (
    <div
      ref={layerRef}
      className="absolute inset-x-0 z-0"
      style={{ top: mobile ? '28%' : '24%', height: mobile ? '32svh' : '38svh' }}
    >
      <div className="relative h-full w-full">
        {heroCards.map((card, i) => (
          <CardFrame key={i} card={card} innerRef={(el) => (cardRefs.current[i] = el)} />
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
  const headlineZoom = useRef(null)
  const trackLayer = useRef(null)
  const trackDrift = useRef(null)
  const avatarScrub = useRef(null)
  const avatarFloat = useRef(null)
  const avatarImg = useRef(null)
  const kickerLeft = useRef(null)
  const kickerRight = useRef(null)
  const driftAvatar = useRef(null)
  const driftKickers = useRef(null)
  const navigate = useNavigate()
  const navigating = useRef(false)
  const isTouch = useIsTouch()
  const [mobile, setMobile] = useState(false)
  const [firstWordDone, setFirstWordDone] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const trackOffset = useRef(0)
  const trackVelocity = useRef(0)
  const trackBow = useRef(0)

  useEffect(() => {
    const measure = () => setMobile(window.innerWidth < 768)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Wait for the intro loader before running the load-in (3s fallback).
  useEffect(() => {
    let fallback = setTimeout(() => setIntroDone(true), 3000)
    const onDone = () => {
      clearTimeout(fallback)
      setIntroDone(true)
    }
    window.addEventListener('intro:done', onDone)
    return () => {
      clearTimeout(fallback)
      window.removeEventListener('intro:done', onDone)
    }
  }, [])

  // Load-in after the intro lifts.
  useEffect(() => {
    if (!introDone || prefersReducedMotion()) return
    const tl = gsap.timeline({ delay: 0.1 })
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
  }, [introDone])

  // Idle float on the avatar image.
  const idleFloatTl = useRef(null)
  useEffect(() => {
    if (prefersReducedMotion() || !avatarFloat.current) return
    idleFloatTl.current = gsap
      .timeline({ repeat: -1, yoyo: true })
      .to(avatarFloat.current, { y: -5, rotate: 0.4, duration: 2.25, ease: 'sine.inOut' })
    return () => idleFloatTl.current?.kill()
  }, [])

  // Spider-Verse glitch on each word swap: magenta/cyan RGB-split ghosts,
  // choppy slice displacement and jitter (see .spidey-* in index.css).
  const surgeTimer = useRef(null)
  const surge = () => {
    if (prefersReducedMotion() || !avatarImg.current) return
    const wrap = avatarImg.current
    wrap.classList.remove('spidey-glitching')
    // force a reflow so re-adding the class restarts the CSS animations
    void wrap.offsetWidth
    wrap.classList.add('spidey-glitching')
    clearTimeout(surgeTimer.current)
    surgeTimer.current = setTimeout(() => wrap.classList.remove('spidey-glitching'), 700)
  }

  // Click the avatar -> glitch + punch toward the viewer, then route to
  // About (a portrait card of him already lives at the top of that page, so
  // the punch reads as "stepping into" it). Reduced motion: instant nav.
  const goToAbout = () => {
    if (navigating.current) return
    navigating.current = true
    if (prefersReducedMotion()) {
      navigate('/about')
      return
    }
    surge()
    idleFloatTl.current?.pause()
    const target = avatarFloat.current
    if (target) {
      gsap.set(target, { rotate: 0 })
      gsap.timeline({ onComplete: () => navigate('/about') })
        .to(target, { scale: 1.06, y: -10, duration: 0.16, ease: 'power2.out' })
        .to(target, { scale: 1.35, y: 6, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.16)
    } else {
      setTimeout(() => navigate('/about'), 500)
    }
  }

  // Input: drag + horizontal wheel steer the rail; vertical wheel scrolls.
  useEffect(() => {
    const sec = section.current
    if (!sec) return
    let dragging = false
    let lastX = 0
    let lastT = 0
    const down = (e) => {
      dragging = true
      lastX = e.clientX
      lastT = performance.now()
      trackVelocity.current = 0
      sec.style.cursor = 'grabbing'
    }
    const move = (e) => {
      if (!dragging) return
      const now = performance.now()
      const dx = e.clientX - lastX
      const dt = Math.max(1, now - lastT)
      trackOffset.current += dx
      trackVelocity.current = (dx / dt) * 1000
      lastX = e.clientX
      lastT = now
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      sec.style.cursor = 'grab'
      trackVelocity.current = Math.max(-2600, Math.min(2600, trackVelocity.current))
    }
    const wheel = (e) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0
      if (!dx) return
      e.preventDefault()
      trackOffset.current -= dx * 1.4
      trackVelocity.current = -dx * 26
    }
    sec.style.cursor = 'grab'
    sec.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    sec.addEventListener('wheel', wheel, { passive: false })
    return () => {
      sec.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      sec.removeEventListener('wheel', wheel)
    }
  }, [])

  // Global cursor drift: ONE smoothed cursor vector glides EVERY layer with
  // per-layer depth (the reference moves the whole scene, slow and smooth),
  // plus the cursor-Y arch modulation on the rail.
  useEffect(() => {
    const sec = section.current
    if (!sec || isTouch || prefersReducedMotion()) return
    const layers = [
      { el: trackDrift.current, fx: -120, fy: -40 },
      { el: headlineWrap.current, fx: -60, fy: -20 },
      { el: driftAvatar.current, fx: -80, fy: 18 },
      { el: driftKickers.current, fx: -95, fy: -30 },
    ].filter((l) => l.el)
    const tos = layers.map((l) => ({
      x: gsap.quickTo(l.el, 'x', { duration: 1.3, ease: 'power2' }),
      y: gsap.quickTo(l.el, 'y', { duration: 1.3, ease: 'power2' }),
      l,
    }))
    const bowTo = gsap.quickTo(trackBow, 'current', { duration: 1.1, ease: 'power2' })
    let raf = 0
    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const r = sec.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width - 0.5
        const ny = (e.clientY - r.top) / r.height - 0.5
        tos.forEach(({ x, y, l }) => {
          x(nx * l.fx)
          y(ny * l.fy)
        })
        // arch: base 1, deepens toward the bottom of the screen
        bowTo(Math.max(0.2, Math.min(1.9, 1 - ny * -1.8)))
        raf = 0
      })
    }
    const onLeave = () => {
      tos.forEach(({ x, y }) => {
        x(0)
        y(0)
      })
      bowTo(1)
    }
    sec.addEventListener('mousemove', onMove, { passive: true })
    sec.addEventListener('mouseleave', onLeave)
    return () => {
      sec.removeEventListener('mousemove', onMove)
      sec.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
      layers.forEach((l) => gsap.killTweensOf(l.el))
      gsap.killTweensOf(trackBow)
    }
  }, [isTouch])

  // Zoom exit: the hero scales up and defocuses as the sheet arrives.
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
        if (headlineZoom.current) {
          headlineZoom.current.style.transform = `scale(${1 + p * 1.4})`
          headlineZoom.current.style.opacity = String(Math.max(0, 1 - p / 0.7))
          headlineZoom.current.style.filter = p > 0.02 ? `blur(${p * 14}px)` : 'none'
        }
        if (trackLayer.current) {
          trackLayer.current.style.transform = `scale(${1 + p * 0.9})`
          trackLayer.current.style.opacity = String(Math.max(0, 1 - p / 0.85))
          trackLayer.current.style.filter = p > 0.02 ? `blur(${p * 10}px)` : 'none'
        }
        if (avatarScrub.current) {
          avatarScrub.current.style.transform = `scale(${1 + p * 0.15})`
          avatarScrub.current.style.opacity = String(Math.max(0, 1 - p / 0.5))
        }
        const kf = Math.max(0, 1 - p / 0.35)
        if (kickerLeft.current) kickerLeft.current.style.opacity = String(kf)
        if (kickerRight.current) kickerRight.current.style.opacity = String(kf)
      },
    })
    return () => trigger.kill()
  }, [])

  return (
    <section
      ref={section}
      className="relative flex min-h-[100svh] w-full flex-col items-center overflow-hidden bg-white"
    >
      <h1 className="sr-only">Abishai Gosula</h1>

      {/* 2. screen track — input-driven horizontal rail, deepest layer */}
      <div ref={trackDrift} className="absolute inset-0 z-0">
        <ScreenTrack
          ref={trackLayer}
          mobile={mobile}
          offsetRef={trackOffset}
          velocityRef={trackVelocity}
          bowRef={trackBow}
        />
      </div>

      {/* 1. bowed two-word pop-swap headline — above the track, behind the avatar */}
      <div
        ref={headlineWrap}
        aria-hidden="true"
        className="pointer-events-none relative z-10 mx-auto mt-28 w-full max-w-[1560px] px-4 text-center md:mt-[120px]"
      >
        <div ref={headlineZoom} style={{ transformOrigin: 'center 30%' }}>
          <div
            className="mx-auto font-anton uppercase text-[#111]"
            style={{
              fontSize: mobile ? 'clamp(2.2rem, 12.5vw, 3.6rem)' : 'clamp(5.5rem, 10.6vw, 10.75rem)',
              letterSpacing: '-0.01em',
            }}
          >
            <PopSwapHeadline
              mobile={mobile}
              onFirstWordDone={() => setFirstWordDone(true)}
              onSwap={surge}
            />
          </div>
        </div>
      </div>

      {/* 3. avatar, front of everything, head overlapping the title */}
      <div ref={driftAvatar} className="pointer-events-none absolute inset-0 z-30">
      <div
        ref={avatarScrub}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-28 md:pb-[10svh]"
        style={{ transformOrigin: 'center 75%' }}
      >
        <div ref={avatarFloat} className="relative flex h-[60svh] items-end md:h-[74svh]">
          <div
            aria-hidden="true"
            className="absolute bottom-1 left-1/2 h-6 w-[46%] -translate-x-1/2 rounded-full md:h-9"
            style={{ background: 'radial-gradient(ellipse, rgba(17,17,17,0.28), rgba(17,17,17,0) 72%)' }}
          />
          {/* Spider-Verse glitch stack: base + RGB-split ghosts + slice bands.
              All copies share the cutout; the ghosts/slices only show while
              .spidey-glitching is on the wrapper (word-swap moments). Also
              the click target that launches into the About page. */}
          <div
            ref={avatarImg}
            role="button"
            tabIndex={0}
            aria-label="Go to About"
            data-cursor="view"
            onClick={goToAbout}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), goToAbout())}
            className="spidey-wrap pointer-events-auto relative h-full cursor-pointer"
          >
            <img
              src="/assets/img/avatar-anime.webp"
              alt="Abishai Gosula"
              className="spidey-base relative block h-full w-auto select-none"
              draggable={false}
            />
            <img src="/assets/img/avatar-anime.webp" alt="" aria-hidden="true" draggable={false}
              className="spidey-ghost spidey-magenta absolute left-0 top-0 h-full w-auto select-none" />
            <img src="/assets/img/avatar-anime.webp" alt="" aria-hidden="true" draggable={false}
              className="spidey-ghost spidey-cyan absolute left-0 top-0 h-full w-auto select-none" />
            <img src="/assets/img/avatar-anime.webp" alt="" aria-hidden="true" draggable={false}
              className="spidey-slice spidey-slice-a absolute left-0 top-0 h-full w-auto select-none" />
            <img src="/assets/img/avatar-anime.webp" alt="" aria-hidden="true" draggable={false}
              className="spidey-slice spidey-slice-b absolute left-0 top-0 h-full w-auto select-none" />
          </div>
        </div>
      </div>

      </div>

      {/* 4. angled kickers (typed on load), measured spots from the recording */}
      <div ref={driftKickers} className="pointer-events-none absolute inset-0 z-20">
        <p
          ref={kickerLeft}
          className="absolute left-[19%] top-[73%] hidden rotate-[-3.5deg] text-[20px] font-extrabold uppercase tracking-[0.1em] text-ink md:block"
          style={{ fontFamily: "'Montserrat', 'Fredoka', sans-serif" }}
        >
          <TypedKicker text="Founder & CS Student" start={firstWordDone && introDone} />
        </p>
        <p
          ref={kickerRight}
          className="absolute right-[26%] top-[73%] hidden rotate-[3.5deg] text-right text-[20px] font-extrabold uppercase tracking-[0.1em] text-ink md:block"
          style={{ fontFamily: "'Montserrat', 'Fredoka', sans-serif" }}
        >
          <TypedKicker text="Ships End to End" start={firstWordDone && introDone} />
        </p>
      </div>
    </section>
  )
}
