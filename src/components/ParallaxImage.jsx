// Image with a masked parallax reveal. If the real image is missing it falls
// back to a designed animated gradient scene (never a flat block).
import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { GradientScene } from './GradientScene'

export function ParallaxImage({ src, alt, label, tone = 'warm', className = '', mono = false }) {
  const mask = useRef(null)
  const img = useRef(null)
  const [failed, setFailed] = useState(!src)

  useEffect(() => {
    const el = img.current
    if (!el || prefersReducedMotion()) return
    const tween = gsap.fromTo(
      el,
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: mask.current, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <div ref={mask} className={`overflow-hidden rounded-3xl ${className}`}>
      <div ref={img} className="h-[120%] w-full">
        {failed ? (
          <GradientScene label={label} tone={tone} className="h-full w-full" rounded="rounded-none" />
        ) : (
          <img
            src={src}
            alt={alt}
            data-mono-gray={mono ? '1' : undefined}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  )
}
