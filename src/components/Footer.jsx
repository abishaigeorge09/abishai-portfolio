// Footer = the full-screen closing scene (revealed as the page lifts; see App).
// A full-bleed scene behind, a centered avatar video, and role/studio labels
// in the bottom corners. Drop your video at the path below.
import { useState } from 'react'
import { GradientScene } from './GradientScene'
import { socials } from '../data/socials'

const FOOTER_VIDEO = '/assets/video/desk-hero.mp4'
const AVATAR_VIDEO = '/assets/video/avatar-tennis.mp4'
const AVATAR_POSTER = '/assets/img/avatar-tennis-poster.jpg'

function SceneVideo() {
  const [failed, setFailed] = useState(false)
  return (
    <div className="absolute inset-0">
      {/* dark room stand-in (always behind) */}
      <GradientScene tone="warm" rounded="rounded-none" className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[#1b1410]/55" />
      {/* real video on top (hides if missing) */}
      {!failed && (
        <video
          src={FOOTER_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cream/30 px-5 py-2 font-display text-xs font-semibold uppercase tracking-widest text-cream/50">
          Your video here · drop {FOOTER_VIDEO}
        </span>
      )}
      {/* vignette for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1b1410]/70 via-transparent to-[#1b1410]/40" />
    </div>
  )
}

export function Footer() {
  return (
    <footer className="relative h-full w-full overflow-hidden bg-[var(--scene-dark)] text-cream">
      <SceneVideo />

      {/* contact - left edge */}
      <div className="absolute left-5 top-1/4 z-10 md:left-10">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cream/45">Contact</p>
        <ul className="flex flex-col gap-2.5 font-display text-base font-semibold">
          {socials.map((s) => (
            <li key={s.key}>
              <a
                href={s.href}
                target={s.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
                data-cursor={s.cursor || undefined}
                className="text-cream/85 transition-colors hover:text-peach"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* centered avatar video card */}
      <div className="absolute inset-0 z-10 grid place-items-center px-5">
        <div className="aspect-[3/4] w-56 max-w-[60vw] overflow-hidden rounded-2xl md:w-72">
          <video
            src={AVATAR_VIDEO}
            poster={AVATAR_POSTER}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* corner labels */}
      <div className="absolute inset-x-0 bottom-24 flex items-end justify-between px-5 font-display text-sm font-semibold md:bottom-4 md:px-10">
        <span className="text-cream/90">
          Founder &amp; Engineer <span className="text-cream/45">2026</span>
        </span>
        <span className="text-cream/90">
          Elsheph Systems <span className="text-cream/45">[Building]</span>
        </span>
      </div>
    </footer>
  )
}
