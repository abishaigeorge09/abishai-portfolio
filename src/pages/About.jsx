// ABOUT - built to feel continuous and alive:
//   1. an editorial dossier hero (AboutHero)
//   2. the story as a stack of living cards (index + cursor tilt + line-by-line reveal)
//   3. a stat strip (count-up + drawing rings) right under "Who I Am"
//   4. Education + Awards as self-drawing timelines
//   5. Off the clock (hobbies) + a dark News & Updates closing card
import { useEffect } from 'react'
import { AboutHero } from '../components/AboutHero'
import { NewsFeature } from '../components/NewsFeature'
import { Hobbies } from '../components/Hobbies'
import { StatStrip } from '../components/StatStrip'
import { SectionCard } from '../components/SectionCard'
import { Timeline } from '../components/Timeline'
import { awards, writing } from '../data/awards'

const EDUCATION = [
  {
    title: 'SRM Institute of Science and Technology',
    sub: 'B.Tech, Computer Science and Engineering',
    meta: '2023 to 2027',
  },
  {
    title: 'UC Berkeley',
    sub: 'Visiting Student, Startup Semester · Overall grade A+',
    meta: '2026',
  },
]

export default function About() {
  // If arrived via /about#awards (e.g. the Portfolio folder), scroll to that section.
  useEffect(() => {
    if (window.location.hash !== '#awards') return
    const id = setTimeout(() => {
      const el = document.getElementById('awards')
      if (!el) return
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -100 })
      else el.scrollIntoView()
    }, 400)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      {/* 1, editorial hero */}
      <AboutHero />

      {/* the story as living cards */}
      <SectionCard index={1} title="Who I Am">
        <p>
          I’m Abishai Gosula, a Computer Science undergraduate and founder building at the
          intersection of AI, embedded vision, and software engineering.
        </p>
        <p>
          I’m an ex-competitive tennis athlete who plays six racket sports, and I’ve been shipping
          products since the beginning, exploring hardware, AI pipelines, and interfaces depending
          on what each problem actually needs.
        </p>
        <p>
          Now I’m building Elsheph Systems, a product studio behind ventures including synth, Benji,
          GMV Live, and Atlitos, creating work that feels useful, human, and built to last.
        </p>
      </SectionCard>

      {/* stat strip - sits right below Who I Am */}
      <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
        <StatStrip
          stats={[
            { value: 5, suffix: '+', label: 'Ventures founded' },
            { value: 6, label: 'Racket sports played' },
            { value: 5, suffix: '+', label: 'Awards & honors' },
            { value: 2, label: 'Berkeley SkyDeck slots' },
          ]}
        />
      </section>

      <SectionCard index={2} title="Approach">
        <p>
          I start from the user’s eyes, then work from the inside out, understanding the product,
          the audience, and the real problem behind the brief.
        </p>
        <p>
          From there I build the whole thing: device, pipeline, and interface. My role isn’t just
          execution. It’s bringing clarity and shipping something that works better, not just looks
          better.
        </p>
      </SectionCard>

      <SectionCard index={3} title="Education">
        <Timeline items={EDUCATION} />
      </SectionCard>

      <SectionCard index={4} title="Philosophy">
        <p>
          I don’t chase trends. I use them when they make sense. The goal is always to build
          something distinctive, something people actually remember.
        </p>
        <p>Every project, whatever the size, deserves the same level of care.</p>
        <p>And faith keeps me grounded, and growth is part of who I am.</p>
      </SectionCard>

      <SectionCard index={5} title="Awards & Certifications" id="awards">
        <Timeline
          items={awards.map((a) => ({
            title: a.title,
            meta: [a.org, a.year].filter(Boolean).join(' · '),
            placeholder: a.placeholder,
          }))}
        />
      </SectionCard>

      <SectionCard index={6} title="Community & Giving">
        <p>
          Through Elsheph Systems, I train and employ young engineers from Andhra Pradesh, building
          a grassroots talent ecosystem in software and AI.
        </p>
        <ul className="flex flex-col gap-3 pt-2">
          {['Chairman, IEEE TEMS SRM Chapter', 'Secretary, LaunchPad SRM', 'ISF Junicorn Global Fellow'].map(
            (r) => (
              <li key={r} className="flex items-center gap-3 font-display font-semibold text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-peach" />
                {r}
              </li>
            )
          )}
        </ul>
      </SectionCard>

      {writing.length > 0 && (
        <SectionCard index={7} title="Writing">
          <div className="grid gap-4">
            {writing.map((post, i) => (
              <a
                key={i}
                href={post.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="view"
                className={`group flex items-center justify-between gap-4 rounded-2xl border p-5 transition-transform duration-300 ease-spring-pill hover:scale-[1.02] ${
                  post.placeholder ? 'border-dashed border-ink/20' : 'border-ink/10'
                }`}
              >
                <div>
                  <span className="block text-xs uppercase tracking-widest text-gray-warm">{post.date}</span>
                  <span className="font-display font-semibold text-ink">{post.title}</span>
                </div>
                <span className="font-display text-sm text-blue">Read →</span>
              </a>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Off the clock - hobbies gallery */}
      <Hobbies />

      {/* dark feature card - closing flourish */}
      <NewsFeature />
    </>
  )
}
