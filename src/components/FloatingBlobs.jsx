// Soft 3D-ish blobs + small glyphs that drift gently. Used in the section below the
// hero (around the personal headline), arranged neatly like the reference.
import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

export function FloatingBlobs({ className = '' }) {
  const root = useRef(null)
  const drift = useRef(null)
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.fb-item').forEach((b, i) => {
        gsap.to(b, {
          x: gsap.utils.random(-28, 28),
          y: gsap.utils.random(-28, 28),
          rotation: gsap.utils.random(-14, 14),
          duration: gsap.utils.random(7, 12),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.5,
        })
      })
    }, el)
    // whole field drifts toward the cursor (parallax over the per-blob idle motion)
    const xTo = gsap.quickTo(drift.current, 'x', { duration: 1, ease: 'power3' })
    const yTo = gsap.quickTo(drift.current, 'y', { duration: 1, ease: 'power3' })
    const onMove = (e) => {
      xTo((e.clientX / window.innerWidth - 0.5) * 50)
      yTo((e.clientY / window.innerHeight - 0.5) * 50)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      ctx.revert()
    }
  }, [])

  const sphere = (at35 = '35% 30%', to = '#ffd9c2') =>
    `radial-gradient(circle at ${at35}, #fff, ${to} 72%)`

  return (
    <div ref={root} className={`pointer-events-none ${className}`} aria-hidden="true">
      <div ref={drift} className="absolute inset-0">
        {/* large left sphere */}
        <div data-mono-blob className="fb-item absolute left-[-4%] top-[6%] h-44 w-44 rounded-full md:h-72 md:w-72"
          style={{ background: sphere('35% 30%', '#ffd9c2'), boxShadow: '0 30px 80px -20px rgba(0,0,0,0.16)' }} />
        {/* right rounded blob */}
        <div data-mono-blob className="fb-item absolute right-[4%] top-[18%] h-40 w-40 rounded-[42%] md:h-64 md:w-64"
          style={{ background: sphere('60% 30%', '#ffbc95'), boxShadow: '0 30px 80px -20px rgba(0,0,0,0.18)' }} />
        {/* center-bottom sphere */}
        <div data-mono-blob className="fb-item absolute bottom-[2%] left-[42%] h-28 w-28 rounded-full md:h-44 md:w-44"
          style={{ background: sphere('40% 35%', '#ffe0cc') }} />
        {/* capsule */}
        <div data-mono-blob className="fb-item absolute left-[34%] top-[44%] h-12 w-28 rounded-full md:h-16 md:w-44"
          style={{ background: sphere('30% 30%', '#e9e2db') }} />
        {/* glyphs */}
        <span className="fb-item absolute left-[26%] top-[52%] h-5 w-5 rounded-full bg-blue" />
        <span className="fb-item absolute right-[20%] top-[64%] grid h-12 w-12 place-items-center rounded-full text-2xl font-bold text-white/70">+</span>
        <svg className="fb-item absolute right-[12%] top-[26%] h-10 w-10 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 4l8 14H4z" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
