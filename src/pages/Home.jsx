// HOME, light/cream. Calm structure with tasteful element-level micro-interactions
// (button waves, secret buttons, hover life) rather than heavy ambient motion.
// hero (pinned, content sheet lifts over it) -> manifesto -> selected work (stack) ->
// recognition/Portfolio folder -> "I sweat the details" parallax ->
// perspective + sharp instincts (pinned, WhyMe) -> CTA -> footer (shared).
import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { ExplorePill } from '../components/ExplorePill'
import { FillHeadline } from '../components/FillHeadline'
import { WorkStack } from '../components/WorkStack'
import { Reveal } from '../components/Reveal'
import { FolderIcons } from '../components/FolderIcons'
import { ParallaxImage } from '../components/ParallaxImage'
import { WhyMe } from '../components/WhyMe'
import { WaveText } from '../components/WaveText'
import { FloatingBlobs } from '../components/FloatingBlobs'
import { CtaPanel } from '../components/CtaPanel'

export default function Home() {
  return (
    <>
      {/* 1, hero - pinned BEHIND, so the content sheet below lifts up and covers it
          (same "expose" feeling as the reveal footer, but at the top of the page).
          data-hero-pin lets ExplorePill's ScrollTrigger share this exact pin span. */}
      <div data-hero-pin className="sticky top-0 z-0 h-[100svh] overflow-hidden">
        <Hero />
      </div>

      {/* the rest of the page is one sheet that rises over the pinned hero */}
      <div className="relative z-10 rounded-t-[2.5rem] bg-white shadow-[0_-16px_50px_-34px_rgba(51,51,51,0.25)]">
      {/* explore pill - re-anchored into the flow, rides up + fades with the sheet */}
      <ExplorePill />
      {/* 2, personal headline with floating blobs (reference-style) */}
      <section className="relative flex min-h-[100svh] flex-col items-center overflow-hidden px-5 pt-28 text-center md:pt-36">
        <div className="relative z-10 max-w-3xl">
          <Reveal variant="mask">
            <h2 className="font-display text-[clamp(2.25rem,5.5vw,4.5rem)] font-bold leading-[1.05] text-gray-warm">
              20 years old, building products and{' '}
              <span className="inline-block rounded-full bg-peach px-4 pb-1 pt-0.5 text-ink">leading</span>{' '}
              the people behind them.
            </h2>
          </Reveal>
          <Reveal variant="up">
            <p className="mx-auto mt-7 max-w-md font-body text-lg text-ink/65">
              Founder and computer-science student. I care more about shipping and leading than
              about the stack.
            </p>
          </Reveal>
        </div>
        <FloatingBlobs className="absolute inset-x-0 bottom-0 top-[42%] z-0" />
      </section>

      {/* 3, selected work (folder stack) */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-24">
        <div className="mb-12 flex items-end justify-between gap-4">
          <Reveal variant="mask">
            <h3 className="font-display text-display-md font-bold text-ink">Selected work</h3>
          </Reveal>
          <Reveal variant="right">
            <Link
              to="/work"
              data-cursor="view"
              className="group/wave inline-flex items-center gap-2 font-display text-sm font-semibold text-ink"
            >
              <WaveText text="View all work" />
              <span className="transition-transform duration-300 ease-spring-pill group-hover/wave:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
        <WorkStack />
      </section>

      {/* 4, recognition / Portfolio folder */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div>
            <Reveal variant="mask">
              <FillHeadline as="h2" fill="peach" className="text-display-md font-bold">
                Recognized for the work.
              </FillHeadline>
            </Reveal>
            <Reveal variant="up">
              <p className="mt-6 max-w-md font-body text-lg text-ink/70">
                Awards, fellowships, and shipped products. Open the folder.
              </p>
            </Reveal>
          </div>
          <Reveal variant="scale">
            <FolderIcons label="Portfolio" fileTitle="Awards & Certifications" to="/about#awards" />
          </Reveal>
        </div>
      </section>

      {/* 5, "I sweat the details" over a photo (parallax) - cream room below it so it
          doesn't collide with the full-bleed dark perspective section that follows.
          The headline overlay sits on the IMAGE only (not the padding) so it stays
          perfectly centered. */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="relative">
          <ParallaxImage
            src="/assets/img/desk-photo.jpg"
            alt="Abishai at his desk"
            label="DESK PHOTO"
            mono
            className="h-[42vh] min-h-[300px] md:h-[70vh] md:min-h-[460px]"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
            <Reveal variant="mask">
              <h2 className="max-w-3xl font-display text-[clamp(2.25rem,8vw,5.5rem)] font-bold text-cream [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
                I sweat the details.
              </h2>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6, perspective + sharp instincts - pinned, points fly in from both sides */}
      <WhyMe />

      {/* 7, CTA panel with hover-to-reveal email */}
      <CtaPanel />
      </div>
    </>
  )
}
