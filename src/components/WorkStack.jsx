// Selected work as a stack of folders. On desktop the folders sit in a tight pile
// and fan out when the section scrolls into view; hovering one lifts it to the front.
// On mobile they fall back to a simple stacked column. Each folder links to the
// project on the Work page.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIsTouch } from '../lib/useIsTouch'
import { ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { projects } from '../data/projects'

const items = projects.filter((p) => !p.placeholder)

function hexToRgba(hex, a) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

// The folder visual (tab + body), no positioning.
function Folder({ p }) {
  return (
    <div className="relative w-[260px] md:w-[300px]">
      {/* tab */}
      <div
        data-mono-tab
        className="absolute -top-6 left-6 rounded-t-xl px-4 py-2 font-display text-sm font-bold text-cream"
        style={{ background: p.accent }}
      >
        {p.name}
      </div>
      {/* body */}
      <div className="overflow-hidden rounded-2xl rounded-tl-none border border-ink/10 bg-cream shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]">
        {/* brand-art strip */}
        <div className="relative h-40 overflow-hidden bg-[var(--scene-tile)]">
          <div data-mono-glow1 className="absolute left-[12%] top-[14%] h-2/3 w-2/3 rounded-full blur-2xl" style={{ background: hexToRgba(p.accent, 0.75) }} />
          <div data-mono-glow2 className="absolute right-[8%] top-[28%] h-1/2 w-1/2 rounded-full blur-2xl" style={{ background: 'rgba(255,188,149,0.6)' }} />
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)', backgroundSize: '12px 12px' }}
          />
          <span className="absolute bottom-3 left-4 font-display text-lg font-bold text-cream">{p.name}</span>
        </div>
        {/* meta */}
        <div className="p-5">
          <p className="min-h-[40px] font-body text-sm text-ink/65">{p.blurb}</p>
          <div className="mt-4 flex items-center justify-between">
            {p.metrics?.[0] ? (
              <span className="font-display text-sm font-semibold text-ink">
                <span className="text-peach">{p.metrics[0].value}</span> {p.metrics[0].label}
              </span>
            ) : (
              <span />
            )}
            <span className="font-display text-sm text-gray-warm">{p.year}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WorkStack() {
  const isTouch = useIsTouch()
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const [active, setActive] = useState(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      setInView(true)
      return
    }
    // Fan out when the section scrolls in. ScrollTrigger is reliable alongside the
    // rest of the GSAP/Lenis setup; a timeout fallback guarantees it never stays piled.
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 78%',
      once: true,
      onEnter: () => setInView(true),
    })
    const t = setTimeout(() => setInView(true), 1200)
    return () => {
      st.kill()
      clearTimeout(t)
    }
  }, [])

  const n = items.length
  const center = (n - 1) / 2
  const spring = 'cubic-bezier(0.275, 1.55, 0.3, 1)'

  // Active folder is driven by the cursor's X position across the whole stack, so
  // moving left→right lifts them one by one with no flicker (they overlap a lot).
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const i = Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * n)))
    setActive(i)
  }

  // Desktop fanned stack.
  const fan = (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setActive(null)}
      className="relative hidden h-[460px] w-full md:block"
    >
      {items.map((p, i) => {
        const off = i - center
        let tx, ty, rot, scale
        if (!inView) {
          tx = off * 5
          ty = off * 5
          rot = off * 1.5
          scale = 0.94
        } else if (active === i) {
          tx = off * 185
          ty = -80
          rot = 0
          scale = 1.08
        } else {
          tx = off * 185
          ty = Math.abs(off) * 16
          rot = off * 5
          scale = 1
        }
        const z = active === i ? 60 : 30 - Math.round(Math.abs(off))
        return (
          <Link
            key={p.slug}
            to={`/work#project-${p.slug}`}
            data-cursor="view"
            className="absolute left-1/2 top-1/2 block"
            style={{
              transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rot}deg) scale(${scale})`,
              transition: `transform 0.65s ${spring}`,
              zIndex: z,
            }}
          >
            <Folder p={p} />
          </Link>
        )
      })}
    </div>
  )

  // Mobile stacked column.
  const column = (
    <div className="flex flex-col items-center gap-12 md:hidden">
      {items.map((p) => (
        <Link key={p.slug} to={`/work#project-${p.slug}`} className="block">
          <Folder p={p} />
        </Link>
      ))}
    </div>
  )

  return (
    <>
      {!isTouch && fan}
      {/* always render column on mobile; on desktop it's hidden via md:hidden */}
      {column}
    </>
  )
}
