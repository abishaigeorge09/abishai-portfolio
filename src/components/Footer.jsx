// Footer = the full-screen closing scene (revealed as the page lifts; see App).
// One full-bleed anime scene video (the AG avatar working on a park bench),
// contact links on the left, role/studio labels in the bottom corners.
import { useState } from 'react'
import { socials } from '../data/socials'

const FOOTER_VIDEO = '/assets/video/avatar-bench.mp4'
const FOOTER_POSTER = '/assets/img/avatar-bench-poster.jpg'

function SceneVideo() {
  const [failed, setFailed] = useState(false)
  return (
    <div className="absolute inset-0 bg-[#f4f2ee]">
      {!failed && (
        <video
          src={FOOTER_VIDEO}
          poster={FOOTER_POSTER}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {/* soft edges for text legibility over the pale scene */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/55 via-transparent to-white/35" />
    </div>
  )
}

export function Footer() {
  return (
    <footer className="relative h-full w-full overflow-hidden bg-[#f4f2ee] text-ink">
      <SceneVideo />

      {/* contact - left edge */}
      <div className="absolute left-5 top-1/4 z-10 md:left-10">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ink/45">Contact</p>
        <ul className="flex flex-col gap-2.5 font-display text-base font-semibold">
          {socials.map((s) => (
            <li key={s.key}>
              <a
                href={s.href}
                target={s.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
                data-cursor={s.cursor || undefined}
                className="text-ink/85 transition-colors hover:text-blue"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* corner labels */}
      <div className="absolute inset-x-0 bottom-24 flex items-end justify-between px-5 font-display text-sm font-semibold md:bottom-4 md:px-10">
        <span className="text-ink/90">
          Founder &amp; Engineer <span className="text-ink/45">2026</span>
        </span>
        <span className="text-ink/90">
          Elsheph Systems <span className="text-ink/45">[Building]</span>
        </span>
      </div>
    </footer>
  )
}
