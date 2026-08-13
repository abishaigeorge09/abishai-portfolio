// 3D folder that "opens" on scroll/hover. The sheet inside is a mini markdown file
// ("Awards & Certifications"); when `to` is set the whole folder links there.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'

export function FolderIcons({ label = 'Portfolio', fileTitle = 'Awards & Certifications', fileName = 'awards.md', to = null }) {
  const root = useRef(null)
  const front = useRef(null)
  const paper = useRef(null)
  const [hovered, setHovered] = useState(false)

  const setOpen = (open) => {
    if (prefersReducedMotion()) return
    gsap.to(front.current, { rotateX: open ? -42 : 0, duration: 0.6, ease: open ? 'springPill' : 'outQuart' })
    gsap.to(paper.current, { y: open ? -30 : 0, opacity: open ? 1 : 0.65, duration: 0.6, ease: 'outQuart' })
  }

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      end: 'bottom 40%',
      onEnter: () => setOpen(true),
      onLeaveBack: () => setOpen(false),
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    setOpen(hovered || undefined)
  }, [hovered])

  const Wrapper = to ? Link : 'div'
  const wrapperProps = to ? { to } : {}

  return (
    <Wrapper
      ref={root}
      {...wrapperProps}
      data-cursor="view"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative mx-auto block h-44 w-56"
      style={{ perspective: '800px' }}
      aria-label={to ? `Open ${fileTitle}` : `${label} folder`}
    >
      {/* back */}
      <div className="absolute bottom-0 h-32 w-full rounded-xl rounded-tl-none bg-blue" />

      {/* mini markdown file that rises */}
      <div
        ref={paper}
        className="absolute bottom-3 left-1/2 h-28 w-[88%] -translate-x-1/2 overflow-hidden rounded-md bg-cream opacity-65 shadow-lg"
      >
        <div data-mono-traffic className="flex items-center gap-1.5 border-b border-ink/10 px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff6159]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
          <span className="ml-1 font-display text-[9px] font-medium text-ink/40">{fileName}</span>
        </div>
        <div className="p-2.5">
          <p className="font-display text-[11px] font-bold leading-tight text-ink">
            <span className="text-peach">#</span> {fileTitle}
          </p>
          <div className="mt-2 space-y-1.5">
            <div className="h-1.5 w-5/6 rounded bg-ink/12" />
            <div className="h-1.5 w-2/3 rounded bg-ink/12" />
            <div className="h-1.5 w-3/4 rounded bg-ink/12" />
          </div>
        </div>
      </div>

      {/* front flap */}
      <div
        ref={front}
        className="absolute bottom-0 h-28 w-full origin-bottom rounded-xl bg-[var(--folder-front)]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <span className="absolute bottom-3 left-4 font-display text-sm font-semibold text-peach">{label}</span>
      </div>
    </Wrapper>
  )
}
