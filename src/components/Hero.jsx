// Hero - frame-by-frame replica of s0animation.com/design's hero, measured
// from a recorded video of the live site (frames in the session's tmp dir):
// - The card gallery is a HORIZONTAL TRACK, not an auto-spinning wheel: it is
//   static at idle and moves only from user input (pointer drag with fling
//   inertia, or horizontal wheel/trackpad deltas), wrapping infinitely.
//   Cards are uniform portrait phones on a ~310px pitch; the pair leaving the
//   viewport renders slightly larger and defocused (out-of-focus foreground).
// - The headline is a giant, gently bowed Anton line that cycles words with a
//   per-letter pop swap (old letters lift out, new letters pop in) while the
//   character flashes to a solid silhouette for a beat (the ref flashes red;
//   this site is mono, so it flashes ink).
// - Kickers type in once on load; the EXPLORE pill lives in the page flow
//   (ExplorePill.jsx) and rides up with the sheet.
// Heights are svh, never vh (mobile browser chrome reflow).
import { forwardRef, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useIsTouch } from '../lib/useIsTouch'
import { heroCards } from '../data/heroCards'

const WORDS = ['FOUNDER', 'BUILDER', 'ENGINEER']
const WORD_MS = 4000

// ---------------------------------------------------------------------------
// Bowed headline with per-letter pop swap (measured: subtle arc, ends dip
// ~25px and rotate a few degrees; swap is pop-in-place, not typing)
// ---------------------------------------------------------------------------

function arcTransform(t, mobile) {
  const amp = mobile ? 10 : 26
  const y = amp * (4 * t * t - 0.4)
  return { y, rotate: (mobile ? 5 : 7) * t * 2, skew: (mobile ? 1.5 : 3) * t }
}

function PopSwapArcWord({ mobile, onFirstWordDone, onSwap }) {
  const [wordIdx, setWordIdx] = useState(0)
  const rootRef = useRef(null)
  const reduced = prefersReducedMotion()
  const firstDoneRef = useRef(false)

  // cycle timer
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
      // roll the current letters out, then swap the word; the new word's
      // entrance runs in the layout effect below
      const glyphs = rootRef.current?.querySelectorAll('.glyph') || []
      gsap.to(glyphs, {
        yPercent: -55,
        opacity: 0,
        rotate: -6,
        duration: 0.2,
        ease: 'power2.in',
        stagger: 0.014,
        onComplete: () => setWordIdx((i) => (i + 1) % WORDS.length),
      })
    }, WORD_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  // entrance pop for each new word
  useEffect(() => {
    if (reduced) return
    const glyphs = rootRef.current?.querySelectorAll('.glyph') || []
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

  const word = WORDS[wordIdx]
  const n = word.length

  return (
    <span ref={rootRef} className="relative block">
      <span className="flex justify-center leading-none">
        {word.split('').map((ch, i) => {
          const t = n > 1 ? i / (n - 1) - 0.5 : 0
          const { y, rotate, skew } = arcTransform(t, mobile)
          return (
            <span
              key={`${wordIdx}-${i}`}
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
              <span className="glyph inline-block will-change-transform">{ch}</span>
            </span>
          )
        })}
      </span>
      {/* reserve the tallest word's box so the swap never reflows the page */}
      <span aria-hidden="true" className="invisible block leading-none">
        {WORDS.reduce((a, b) => (a.length > b.length ? a : b))}
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
// Screen track — infinite horizontal card rail, input-driven (measured: the
// reference gallery is still at idle; drag and horizontal wheel move it and
// it coasts to a stop)
// ---------------------------------------------------------------------------

const PITCH_DESKTOP = 310
const PITCH_MOBILE = 190

const ScreenTrack = forwardRef(function ScreenTrack({ mobile, offsetRef, velocityRef }, layerRef) {
  const cardRefs = useRef([])
  const reduced = prefersReducedMotion()
  const pitch = mobile ? PITCH_MOBILE : PITCH_DESKTOP
  const loop = heroCards.length * pitch

  const applyFrame = (offset) => {
    const half = loop / 2
    for (let i = 0; i < heroCards.length; i++) {
      const el = cardRefs.current[i]
      if (!el) continue
      // wrap each card's track position into [-loop/2, +loop/2] around center
      let dx = (i * pitch + offset) % loop
      if (dx > half) dx -= loop
      if (dx < -half) dx += loop
      const ax = Math.abs(dx)
      // measured falloff: uniform size through the middle band, the leaving
      // pair grows slightly and defocuses; gone shortly past the viewport edge
      const grow = Math.max(0, (ax - (mobile ? 260 : 520)) / (mobile ? 220 : 420))
      const scale = 1 + Math.min(0.22, grow * 0.22)
      const blur = Math.min(9, Math.max(0, (ax - (mobile ? 210 : 400)) / (mobile ? 190 : 380)) * 9)
      const fade = Math.max(0, (ax - (mobile ? 420 : 900)) / (mobile ? 160 : 260))
      el.style.transform = `translate(-50%, -50%) translateX(${dx}px) scale(${scale})`
      el.style.filter = blur > 0.4 ? `blur(${blur}px)` : 'none'
      el.style.opacity = String(Math.max(0, 1 - fade))
      el.style.zIndex = String(100 + Math.round(grow * 50))
    }
  }

  useEffect(() => {
    applyFrame(offsetRef.current)
    if (reduced) return
    const tick = (time, dtMs) => {
      const dt = Math.min(0.1, dtMs / 1000)
      // coast: velocity decays toward zero; the track is otherwise still
      velocityRef.current *= Math.pow(0.06, dt) > 0.94 ? 0.94 : Math.pow(0.94, dt * 60)
      if (Math.abs(velocityRef.current) < 0.02) velocityRef.current = 0
      offsetRef.current += velocityRef.current * dt
      applyFrame(offsetRef.current)
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, mobile])

  return (
    <div
      ref={layerRef}
      className="absolute inset-x-0 z-0"
      style={{ top: mobile ? '24%' : '19.5%', height: mobile ? '38svh' : '45.5svh' }}
    >
      <div className="relative h-full w-full">
        {heroCards.map((card, i) => (
          <div
            key={i}
            ref={(el) => (cardRefs.current[i] = el)}
            className="absolute left-1/2 top-1/2 h-[300px] w-[152px] overflow-hidden rounded-[22px] border border-ink/10 bg-white shadow-[0_26px_60px_-34px_rgba(17,17,17,0.35)] will-change-transform md:h-[435px] md:w-[218px] md:rounded-[30px]"
          >
            <img src={card.src} alt={card.alt} className="h-full w-full grayscale object-cover" draggable={false} />
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
  const trackLayer = useRef(null)
  const trackDrift = useRef(null)
  const avatarScrub = useRef(null)
  const avatarFloat = useRef(null)
  const avatarImg = useRef(null)
  const kickerLeft = useRef(null)
  const kickerRight = useRef(null)
  const isTouch = useIsTouch()
  const [mobile, setMobile] = useState(false)
  const [firstWordDone, setFirstWordDone] = useState(false)
  // track offset (px along the rail) + coasting velocity (px/s)
  const trackOffset = useRef(0)
  const trackVelocity = useRef(0)

  useEffect(() => {
    const measure = () => setMobile(window.innerWidth < 768)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Load-in: avatar rises after the first word pops in; kickers follow.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const tl = gsap.timeline({ delay: 0.4 })
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

  // Idle float on the avatar image (independent of the scroll-scrub wrapper).
  useEffect(() => {
    if (prefersReducedMotion() || !avatarFloat.current) return
    const tl = gsap
      .timeline({ repeat: -1, yoyo: true })
      .to(avatarFloat.current, { y: -5, rotate: 0.4, duration: 2.25, ease: 'sine.inOut' })
    return () => tl.kill()
  }, [])

  // Surge flash: on every word swap the character goes solid ink for a beat
  // (the reference flashes solid red at the same moment).
  const surge = () => {
    if (prefersReducedMotion() || !avatarImg.current) return
    const el = avatarImg.current
    gsap.timeline()
      .to(el, { filter: 'brightness(0)', duration: 0.1, ease: 'power1.in' })
      .to(el, { filter: 'brightness(1)', duration: 0.3, ease: 'power2.out' }, '+=0.12')
  }

  // Input: pointer drag anywhere on the hero, or horizontal wheel/trackpad
  // deltas, move the track; release lets it coast (matches the recording).
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
      // horizontal intent only: trackpad side-swipes and shift+wheel steer the
      // rail; vertical wheel keeps scrolling the page
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

  // Cursor parallax on the track layer.
  useEffect(() => {
    const sec = section.current
    const el = trackDrift.current
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

  // Scroll pull: headline lifts out per-letter, track fades/blurs, avatar
  // settles away, kickers slide off — scrubbed over the hero's pin span.
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
        const glyphs = headlineWrap.current ? headlineWrap.current.querySelectorAll('.arc-glyph') : []
        const n = glyphs.length
        glyphs.forEach((el, i) => {
          const stagger = n > 1 ? i / (n - 1) : 0
          const local = gsap.utils.clamp(0, 1, (p - stagger * 0.25) / 0.75)
          el.style.setProperty('--sy', `${-local * 90}px`)
          el.style.setProperty('--srot', `${-local * 10}deg`)
          el.style.setProperty('--sop', String(1 - local))
        })
        if (trackLayer.current) {
          trackLayer.current.style.opacity = String(1 - p)
          trackLayer.current.style.filter = p > 0.01 ? `blur(${p * 8}px)` : 'none'
        }
        if (avatarScrub.current) {
          avatarScrub.current.style.transform = `translateY(${p * 46}px) scale(${1 - p * 0.08})`
          avatarScrub.current.style.opacity = String(1 - p)
        }
        if (kickerLeft.current) {
          kickerLeft.current.style.transform = `translateX(${-p * 140}px) rotate(-3.5deg)`
          kickerLeft.current.style.opacity = String(1 - p)
        }
        if (kickerRight.current) {
          kickerRight.current.style.transform = `translateX(${p * 140}px) rotate(3.5deg)`
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
      {/* Real heading for search + screen readers. */}
      <h1 className="sr-only">Abishai Gosula</h1>

      {/* 2. screen track — input-driven horizontal rail, deepest layer */}
      <div ref={trackDrift} className="absolute inset-0 z-0">
        <ScreenTrack
          ref={trackLayer}
          mobile={mobile}
          offsetRef={trackOffset}
          velocityRef={trackVelocity}
        />
      </div>

      {/* 1. bowed pop-swap headline — above the track, behind the avatar */}
      <div
        ref={headlineWrap}
        aria-hidden="true"
        className="pointer-events-none relative z-10 mx-auto mt-24 w-full max-w-[1500px] px-4 text-center md:mt-[64px]"
      >
        <div
          className="mx-auto font-anton uppercase text-[#111]"
          style={{
            fontSize: mobile ? 'clamp(2.5rem, 15.5vw, 4.25rem)' : 'clamp(5.5rem, 9.8vw, 10rem)',
            letterSpacing: '-0.01em',
          }}
        >
          <PopSwapArcWord mobile={mobile} onFirstWordDone={() => setFirstWordDone(true)} onSwap={surge} />
        </div>
      </div>

      {/* 3. avatar, front of everything, head overlapping the title */}
      <div
        ref={avatarScrub}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-36 md:pb-[10svh]"
      >
        <div ref={avatarFloat} className="relative flex h-[42svh] items-end md:h-[74svh]">
          <div
            aria-hidden="true"
            className="absolute bottom-1 left-1/2 h-6 w-[46%] -translate-x-1/2 rounded-full md:h-9"
            style={{ background: 'radial-gradient(ellipse, rgba(17,17,17,0.28), rgba(17,17,17,0) 72%)' }}
          />
          <img
            ref={avatarImg}
            src="/assets/img/avatar-anime.webp"
            alt=""
            className="relative block h-full w-auto select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 4. angled kickers (typed on load), in the gap under the cards */}
      <p
        ref={kickerLeft}
        className="pointer-events-none absolute left-[6%] top-[34%] z-20 max-w-[8rem] rotate-[-3.5deg] text-[12px] font-extrabold uppercase tracking-[0.1em] text-ink md:left-[17.5%] md:top-[67.5%] md:max-w-none md:text-[19px]"
        style={{ fontFamily: "'Montserrat', 'Fredoka', sans-serif" }}
      >
        <TypedKicker text="Founder & CS Student" start={firstWordDone} />
      </p>
      <p
        ref={kickerRight}
        className="pointer-events-none absolute right-[6%] top-[38%] z-20 max-w-[8rem] rotate-[3.5deg] text-right text-[12px] font-extrabold uppercase tracking-[0.1em] text-ink md:right-[21.5%] md:top-[66%] md:max-w-none md:text-[19px]"
        style={{ fontFamily: "'Montserrat', 'Fredoka', sans-serif" }}
      >
        <TypedKicker text="Ships End to End" start={firstWordDone} />
      </p>
    </section>
  )
}
