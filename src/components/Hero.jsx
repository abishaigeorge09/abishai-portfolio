// Hero - the Canva composition. A gradient mesh backdrop sampled from the
// artwork itself, with the composed plate centred on top and never cropped.
//
// Why the plate is `object-contain` rather than a full-bleed cover: the artwork
// carries its own typography ("ABISHAI" / "GOSULA" and the intro copy), so any
// crop cuts words. Containing it keeps every aspect ratio readable, and because
// --hero-mesh is sampled from the same image the letterboxing is invisible.
//
// The name and tagline are ALSO rendered as real text (visually hidden) so the
// page still has a genuine <h1> for search engines and screen readers. Text
// baked into a picture is text nobody can select, translate or search.
//
// To replace the artwork: export from Canva, regenerate the avif/webp/jpg set
// into /public/assets/img/, and re-sample --hero-mesh in styles/tokens.css.
import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

export function Hero() {
  const section = useRef(null)
  const plate = useRef(null)

  useEffect(() => {
    const sec = section.current
    if (!sec || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 })
      tl.from(plate.current, { opacity: 0, scale: 1.04, y: 18, duration: 1.1, ease: 'power3.out' })
      tl.to('.hero-cue', { opacity: 1, duration: 0.6 }, '-=0.4')
    }, sec)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={section}
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--hero-mesh)' }}
    >
      {/* The real heading. Reaches search and assistive tech, not the eye,
          because the artwork already shows it. */}
      <h1 className="sr-only">
        Abishai Gosula. Helping ideas become real products through AI, embedded vision, and software.
      </h1>

      <picture>
        <source
          type="image/avif"
          sizes="100vw"
          srcSet="/assets/img/hero-1366.avif 1366w, /assets/img/hero-2732.avif 2732w"
        />
        <source
          type="image/webp"
          sizes="100vw"
          srcSet="/assets/img/hero-1366.webp 1366w, /assets/img/hero-2732.webp 2732w"
        />
        <img
          ref={plate}
          src="/assets/img/hero-1366.jpg"
          width={2732}
          height={1536}
          fetchPriority="high"
          decoding="async"
          alt="Abishai Gosula, beside the words: I'm Abishai Gosula. Helping ideas become real products through AI, embedded vision, and software."
          className="relative z-10 w-full max-w-[1600px] select-none object-contain md:max-h-[100svh]"
        />
      </picture>

      {/* Phones only. The artwork is 16:9, so on a 430px screen its baked intro
          copy lands around 5px and cannot be read. Cropping is not the answer:
          "ABISHAI" and "GOSULA" span most of the width, and a phone-shaped
          window only exposes about 46% of it, so every crop slices a word in
          half. The plate therefore stays whole (the names still read large) and
          the sentence returns here as real, selectable text. */}
      <div className="relative z-10 mt-7 w-full max-w-[34rem] px-7 text-ink md:hidden">
        <p className="font-display text-xl font-bold italic">I&rsquo;m Abishai Gosula!</p>
        <p className="mt-2 text-base leading-relaxed">
          Helping ideas become real products through AI, embedded vision, and software.
        </p>
      </div>

      <div className="hero-cue absolute bottom-8 left-1/2 z-20 -translate-x-1/2 opacity-0">
        <span className="flex flex-col items-center gap-2 text-ink/70">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <span className="h-8 w-px bg-gradient-to-b from-ink/60 to-transparent" />
        </span>
      </div>
    </section>
  )
}
