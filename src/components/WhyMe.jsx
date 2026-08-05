// "perspective + sharp instincts" - a single full-bleed photo of AG with the copy
// laid over the left. On enter, the kicker + headline reveal word by word and the
// divider line draws across. On desktop the section pins: you arrive seeing the
// headline + first three points, and scrolling lifts the column to reveal the
// fourth point and the button. The photo drifts subtly with the cursor.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { GradientScene } from './GradientScene'
import { useMagnetic } from '../lib/useMagnetic'

const KICKER = 'Clients partner with me because of my'
const POINTS = [
  'I bring a sharp product perspective, not just code.',
  'I sweat the craft, from first idea to shipped product.',
  'I lead the team and own the outcome, end to end.',
  'I turn ambiguity into products people actually use.',
]

// split a string into word <span>s so each can animate independently
function Words({ text, className = '' }) {
  return text.split(' ').map((w, i) => (
    <span key={i} className="inline-block overflow-hidden align-bottom">
      <span className={`wm-word inline-block ${className}`}>{w}&nbsp;</span>
    </span>
  ))
}

export function WhyMe() {
  const section = useRef(null)
  const col = useRef(null)
  const line = useRef(null)
  const photo = useRef(null)
  const magnet = useMagnetic(0.3)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = section.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      // entrance (plays once as the section comes up): word-by-word headline, the line
      // draws across, then each point slides in from the left, one clearly after another.
      const intro = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      })
      intro
        .from('.wm-word', { yPercent: 110, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.04 })
        .from(line.current, { scaleX: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.3')
        .from('.wm-point', { opacity: 0, x: -80, duration: 0.7, ease: 'power3.out', stagger: 0.2 }, '-=0.2')
        .from('.wm-cta', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.2')

      // desktop only: pin the section, then lift the column on scroll so the headline
      // rises away and the fourth point + button come into view.
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        gsap.fromTo(
          col.current,
          { y: 0 },
          {
            y: () => Math.min(0, window.innerHeight - col.current.scrollHeight - 56),
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: '+=120%',
              scrub: true,
              pin: true,
              invalidateOnRefresh: true,
            },
          }
        )
      })

      // photo drifts gently toward the cursor (smooth, springy)
      const xTo = gsap.quickTo(photo.current, 'x', { duration: 0.9, ease: 'power3.out' })
      const yTo = gsap.quickTo(photo.current, 'y', { duration: 0.9, ease: 'power3.out' })
      const onMove = (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 28
        const cy = (e.clientY / window.innerHeight - 0.5) * 28
        xTo(-cx)
        yTo(-cy)
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} className="relative h-[100svh] w-full overflow-hidden bg-[var(--scene-dark)] text-cream">
      {/* ONE full-bleed photo of AG - TODO: drop /assets/img/whyme.jpg */}
      <div ref={photo} className="absolute inset-0 scale-[1.06]">
        {failed ? (
          <GradientScene tone="warm" rounded="rounded-none" className="absolute inset-0 h-full w-full" label="YOUR PHOTO · drop whyme.jpg" />
        ) : (
          <img src="/assets/img/whyme.jpg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" onError={() => setFailed(true)} />
        )}
      </div>
      {/* warm wash: dark on the left for legible text, photo breathing on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--scene-dark)]/92 via-[var(--scene-dark)]/55 to-[var(--scene-dark)]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--scene-dark)]/60 via-transparent to-transparent" />

      {/* left content column (lifted on scroll to reveal point 4) */}
      <div ref={col} className="absolute inset-x-0 top-0 px-5 will-change-transform md:px-14">
        <div className="max-w-[48rem] pt-[8vh] md:pb-[22vh] md:pt-[15vh]">
          <p className="font-display text-base font-semibold uppercase tracking-[0.14em] text-peach/90 md:text-2xl">
            <Words text={KICKER} />
          </p>
          <h2 className="mt-3 font-display font-bold leading-[0.88] text-peach md:mt-4">
            <span className="block text-[clamp(2.6rem,10vw,7rem)]">
              <Words text="perspective +" />
            </span>
            <span className="block text-[clamp(2.6rem,10vw,7rem)]">
              <Words text="sharp instincts" />
            </span>
          </h2>

          <div ref={line} className="mt-6 h-[3px] w-full origin-left bg-peach/60 md:mt-10" />

          <ul className="flex flex-col">
            {POINTS.map((p, i) => (
              <li
                key={i}
                className="wm-point grid grid-cols-[auto_1fr] items-center gap-5 border-b-2 border-cream/15 py-4 md:gap-8 md:py-6"
              >
                <span className="font-display text-2xl font-bold leading-none text-peach/80 md:text-4xl">
                  0{i + 1}
                </span>
                <span className="font-display text-lg font-semibold leading-[1.2] text-cream md:text-[1.7rem]">
                  {p}
                </span>
              </li>
            ))}
          </ul>

          <Link
            ref={magnet}
            to="/about"
            data-cursor="view"
            className="group mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-cream/10 py-3 pl-6 pr-3 font-display text-base font-semibold text-cream backdrop-blur transition-transform duration-300 ease-spring-pill hover:scale-105 md:mt-9 md:text-lg"
          >
            Learn more about me
            <span className="grid h-10 w-10 place-items-center rounded-full bg-peach transition-transform duration-300 ease-spring-pill group-hover:rotate-45">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 13L13 3M13 3H5M13 3V11" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
