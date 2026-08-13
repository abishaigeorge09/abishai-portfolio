// "Off the clock" - a scattered polaroid scrapbook of AG's hobbies (tennis, racket
// sports, football, family). Photos drop in tilted on scroll and straighten + lift +
// come to front on hover. Drop real photos at the paths below.
import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

// Evenly spread across two rows so nothing overlaps or clusters to one side.
const HOBBIES = [
  { src: '/assets/img/hobbies/tennis.jpg', label: 'Tennis', accent: '#1FB58F', pos: { left: '1%', top: '2%' }, rot: '-rotate-3' },
  { src: '/assets/img/hobbies/football.jpg', label: 'Football with friends', accent: '#2E54FE', pos: { left: '26%', top: '3%' }, rot: 'rotate-2' },
  { src: '/assets/img/hobbies/family.jpg', label: 'Family time', accent: '#FF7A59', pos: { left: '51%', top: '1%' }, rot: '-rotate-2' },
  { src: '/assets/img/hobbies/squash.jpg', label: 'Squash', accent: '#5BD6A8', pos: { left: '75%', top: '3%' }, rot: 'rotate-3' },
  { src: '/assets/img/hobbies/friends.jpg', label: 'With the crew', accent: '#FF9D4D', pos: { left: '13%', top: '51%' }, rot: 'rotate-2' },
  { src: '/assets/img/hobbies/court.jpg', label: 'On court', accent: '#FFBC95', pos: { left: '39%', top: '52%' }, rot: '-rotate-3' },
  { src: '/assets/img/hobbies/racket.jpg', label: 'Six racket sports', accent: '#7A5CFF', pos: { left: '64%', top: '51%' }, rot: 'rotate-2' },
]

function Polaroid({ h, z = 10 }) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      className={`group relative w-48 rounded-md bg-white p-3 pb-9 shadow-[0_8px_20px_-14px_rgba(0,0,0,0.25)] transition-transform duration-500 ease-spring-pill md:w-56 ${h.rot} hover:z-50 hover:-translate-y-2 hover:rotate-0 hover:scale-[1.05]`}
      style={{ zIndex: z }}
    >
      {/* tape */}
      <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-2 rounded-sm bg-cream/70 shadow-sm" aria-hidden="true" />
      <div className="aspect-[4/5] overflow-hidden rounded-sm">
        {failed ? (
          <div className="h-full w-full" style={{ background: `linear-gradient(150deg, ${h.accent}, #ffd9c2)` }}>
            <div className="h-full w-full opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
          </div>
        ) : (
          <img src={h.src} alt={h.label} loading="lazy" className="h-full w-full object-cover" onError={() => setFailed(true)} />
        )}
      </div>
      <span className="absolute inset-x-0 bottom-2.5 text-center font-display text-sm font-semibold text-ink">{h.label}</span>
    </div>
  )
}

export function Hobbies() {
  const scatter = useRef(null)
  useEffect(() => {
    const el = scatter.current
    if (!el || prefersReducedMotion()) return
    const t = gsap.from(el.querySelectorAll('.drop-in'), {
      opacity: 0,
      y: -60,
      duration: 0.85,
      ease: 'back.out(1.4)',
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 78%' },
    })
    // gentle nudge on the mobile "Swipe" arrow to hint the horizontal scroll
    const nudge = gsap.to('.hb-arrow', { x: 6, duration: 0.8, ease: 'sine.inOut', repeat: -1, yoyo: true })
    return () => {
      t.scrollTrigger?.kill()
      t.kill()
      nudge.kill()
    }
  }, [])

  return (
    <section className="scroll-mt-28 border-t border-ink/10 py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <h2 className="font-display text-display-md font-bold text-peach">Off the clock.</h2>
          {/* mobile-only affordance: the cards scroll horizontally */}
          <span className="flex shrink-0 items-center gap-2 font-display text-xs font-semibold uppercase tracking-widest text-ink/45 md:hidden">
            Swipe
            <svg className="hb-arrow" width="26" height="14" viewBox="0 0 26 14" fill="none">
              <path d="M1 7h22M18 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        {/* desktop: scattered scrapbook */}
        <div ref={scatter} className="relative hidden h-[680px] md:block">
          {HOBBIES.map((h, i) => (
            <div key={i} className="drop-in absolute" style={h.pos}>
              <Polaroid h={h} z={10 + i} />
            </div>
          ))}
        </div>

        {/* mobile: horizontal scroll of polaroids */}
        <div className="flex gap-6 overflow-x-auto pb-4 pt-3 md:hidden">
          {HOBBIES.map((h, i) => (
            <div key={i} className="shrink-0">
              <Polaroid h={h} z={10} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
