// About landing - an editorial "dossier" rather than a centered statement: a large
// left name, a portrait card with a floating tag, a meta dossier (role/location/
// studio/status), and a continuously scrolling role marquee along the bottom. Its own
// look, distinct from the type-only home hero.
import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText, prefersReducedMotion } from '../lib/gsap'
import { GradientScene } from './GradientScene'
import { useMagnetic } from '../lib/useMagnetic'
import { site } from '../config/site'

const META = [
  { label: 'Role', value: 'Founder & CS student' },
  { label: 'Based in', value: 'Hyderabad · global' },
  { label: 'Studio', value: 'Elsheph Systems' },
  { label: 'Status', value: 'Open to build' },
]

const MARQUEE = ['Founder', 'Engineer', 'CS student', 'Product', 'Builder', 'Athlete']

export function AboutHero() {
  const root = useRef(null)
  const name = useRef(null)
  const magnet = useMagnetic(0.35)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const split = new SplitText(name.current, { type: 'chars' })
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
      tl.from('.ab-kicker', { y: 16, opacity: 0, duration: 0.5 })
        .from(split.chars, { yPercent: 120, opacity: 0, duration: 0.8, stagger: 0.035 }, '-=0.2')
        .from('.ab-portrait', { scale: 0.9, opacity: 0, rotate: -4, duration: 0.9, ease: 'back.out(1.4)' }, '-=0.7')
        .from('.ab-tag', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.3')
        .from('.ab-meta-row', { y: 18, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.5')
        .from('.ab-cta', { y: 16, opacity: 0, duration: 0.5 }, '-=0.4')
      // looping role marquee
      gsap.to('.ab-track', { xPercent: -50, duration: 22, ease: 'none', repeat: -1 })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative flex min-h-screen flex-col overflow-hidden">
      {/* soft accents */}
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-peach/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 bottom-24 h-72 w-72 rounded-full bg-[var(--peach-tint)]/40 blur-3xl" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-center px-5 pb-16 pt-28 md:px-10 md:pb-12 md:pt-28">
        <div className="grid w-full items-center gap-10 md:grid-cols-12 md:gap-12">
          {/* text / dossier */}
          <div className="md:col-span-6 lg:col-span-6">
            <p className="ab-kicker mb-4 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-ink/45">
              <span className="h-px w-8 bg-ink/30" /> About
            </p>
            <h1
              ref={name}
              className="font-display text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.84] text-ink"
            >
              Abishai
              <br />
              Gosula
              <span className="ml-3 inline-block h-3 w-3 translate-y-[-0.1em] rounded-full bg-blue align-baseline md:h-4 md:w-4" />
            </h1>

            <p className="ab-meta-row mt-6 max-w-md font-body text-base leading-relaxed text-ink/65 md:text-lg">
              Building at the intersection of AI, embedded vision, and software. Products that
              feel useful, human, and built to last.
            </p>

            {/* meta dossier */}
            <dl className="mt-6 grid max-w-md grid-cols-2 gap-x-8 gap-y-4">
              {META.map((m) => (
                <div key={m.label} className="ab-meta-row border-t border-ink/10 pt-3">
                  <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/40">
                    {m.label}
                  </dt>
                  <dd className="mt-1 font-display text-base font-semibold text-ink">{m.value}</dd>
                </div>
              ))}
            </dl>

            {site.resumeUrl && (
              <a
                ref={magnet}
                href={site.resumeUrl}
                download
                target="_blank"
                rel="noopener"
                className="ab-cta group mt-7 inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3 font-display text-sm font-semibold text-cream transition-transform duration-300 ease-spring-pill hover:scale-105"
              >
                Download résumé
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-y-0.5">
                  <path d="M8 2v8M8 10L4.5 6.5M8 10l3.5-3.5M3 14h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </div>

          {/* portrait card */}
          <div className="md:col-span-6 lg:col-span-6">
            <div className="ab-portrait relative mx-auto aspect-[3/4] w-full max-w-[300px] rotate-2 md:max-w-[420px]">
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-[0_40px_90px_-30px_rgba(51,51,51,0.4)]">
                {failed ? (
                  <GradientScene tone="warm" rounded="rounded-[2rem]" className="h-full w-full" label="PORTRAIT" />
                ) : (
                  <img
                    src="/assets/img/portrait.jpg"
                    alt="Abishai Gosula"
                    className="h-full w-full object-cover"
                    onError={() => setFailed(true)}
                  />
                )}
              </div>
              {/* floating tag */}
              <span className="ab-tag absolute -left-3 top-8 -rotate-6 rounded-full bg-blue px-4 py-2 font-display text-sm font-semibold text-cream shadow-lg md:-left-6">
                Hi, I&apos;m Abishai 👋
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* role marquee */}
      <div className="relative overflow-hidden border-t border-ink/10 py-4 pb-24 md:pb-5">
        {/* four copies so each half is wider than the viewport; the -50% loop is seamless */}
        <div className="ab-track kinetic flex w-max items-center whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((w, i) => (
            <span key={i} className="flex items-center font-display text-2xl font-bold text-ink/30 md:text-4xl">
              {w}
              <span className="mx-6 inline-block h-2 w-2 rounded-full bg-peach md:mx-9" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
