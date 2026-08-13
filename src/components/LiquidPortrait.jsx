// Portrait with a liquid-hover distortion. WebGL only when it is worth it:
// pointer devices, motion allowed, and a context that actually creates. Every
// other case renders the exact same <picture> markup Hero.jsx used to render
// directly, so there is only ever one visual fallback to reason about.
import { forwardRef, useEffect, useRef, useState } from 'react'
import { Renderer, Program, Mesh, Triangle, Texture, Flowmap } from 'ogl'
import { prefersReducedMotion } from '../lib/gsap'
import { useIsTouch } from '../lib/useIsTouch'

// WebGL support is a fixed capability of the browser for the whole session,
// so probe it once (constructing a real ogl Renderer, not just checking the
// constructor exists) and cache the answer at module scope.
let webglSupported
function canUseWebGL() {
  if (webglSupported !== undefined) return webglSupported
  try {
    const probe = document.createElement('canvas')
    const renderer = new Renderer({ canvas: probe, alpha: true })
    webglSupported = !!renderer.gl
  } catch {
    webglSupported = false
  }
  return webglSupported
}

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

// Samples the portrait offset by the flowmap's stored displacement, so the
// smear is whatever velocity the cursor painted into the flowmap and is
// relaxing back to zero (the flowmap's own dissipation, not this shader).
const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  uniform sampler2D tFlow;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;
    vec2 uv = vUv - flow.xy * uStrength;
    gl_FragColor = texture2D(tMap, uv);
  }
`

export const LiquidPortrait = forwardRef(function LiquidPortrait(
  {
    src = '/assets/img/portrait-1800.webp',
    fallbackSrc = '/assets/img/portrait-900.png',
    className = '',
  },
  ref
) {
  const isTouch = useIsTouch()
  const [reduced] = useState(prefersReducedMotion)
  const [supported] = useState(canUseWebGL)
  const useLiquid = supported && !isTouch && !reduced

  if (!useLiquid) {
    return (
      <picture>
        <source
          type="image/avif"
          sizes="(min-width: 768px) 900px, 800px"
          srcSet="/assets/img/portrait-900.avif 900w, /assets/img/portrait-1800.avif 1800w"
        />
        <source
          type="image/webp"
          sizes="(min-width: 768px) 900px, 800px"
          srcSet="/assets/img/portrait-900.webp 900w, /assets/img/portrait-1800.webp 1800w"
        />
        <img
          ref={ref}
          src={fallbackSrc}
          width={1889}
          height={1913}
          fetchPriority="high"
          decoding="async"
          alt="Abishai Gosula"
          className={className}
        />
      </picture>
    )
  }

  return <LiquidCanvas ref={ref} src={src} className={className} />
})

const LiquidCanvas = forwardRef(function LiquidCanvas({ src, className }, ref) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let renderer
    try {
      renderer = new Renderer({ canvas, alpha: true, antialias: true, dpr })
    } catch {
      return
    }
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)

    const geometry = new Triangle(gl)
    const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR })
    // 0.94 dissipation ~= the stamp relaxes back to flat over roughly a
    // second at 60fps, which is the "liquid settling" feel the brief asks for.
    const flowmap = new Flowmap(gl, { size: 256, falloff: 0.22, alpha: 1, dissipation: 0.94 })

    const program = new Program(gl, {
      vertex,
      fragment,
      depthTest: false,
      uniforms: {
        tMap: { value: texture },
        tFlow: flowmap.uniform,
        uStrength: { value: 0.12 },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    // Known crop ratio of the portrait asset; corrected once the real image
    // has loaded so a slow network never distorts the layout in between.
    let naturalAspect = 1889 / 1913
    const image = new Image()
    image.decoding = 'async'
    image.src = src
    image.onload = () => {
      texture.image = image
      naturalAspect = image.naturalWidth / image.naturalHeight
      resize()
    }

    const resize = () => {
      const height = parent.clientHeight || 1
      const width = Math.max(1, Math.round(height * naturalAspect))
      renderer.setSize(width, height)
      flowmap.aspect = width / height
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    // Pointer + velocity, tracked only while the pointer is actually over the
    // canvas. Velocity decays on its own once movement stops or the pointer
    // leaves, so the liquid keeps relaxing instead of snapping flat.
    const mouse = { x: 0.5, y: 0.5 }
    const last = { x: 0.5, y: 0.5 }
    let inside = false

    const toUv = (e) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: (e.clientX - rect.left) / rect.width,
        y: 1 - (e.clientY - rect.top) / rect.height,
      }
    }
    const onPointerMove = (e) => {
      const uv = toUv(e)
      mouse.x = uv.x
      mouse.y = uv.y
      inside = true
    }
    const onPointerLeave = () => {
      inside = false
    }
    canvas.addEventListener('pointermove', onPointerMove, { passive: true })
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true })

    // Pause the RAF loop entirely once the hero scrolls out of view.
    let visible = true
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0 })
    io.observe(parent)

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return

      flowmap.mouse.set(mouse.x, mouse.y)
      flowmap.velocity.x = inside ? (mouse.x - last.x) * 4 : flowmap.velocity.x * 0.9
      flowmap.velocity.y = inside ? (mouse.y - last.y) * 4 : flowmap.velocity.y * 0.9
      last.x = mouse.x
      last.y = mouse.y

      flowmap.update()
      renderer.render({ scene: mesh, clear: true })
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [src])

  return (
    <canvas
      ref={(node) => {
        canvasRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      aria-hidden="true"
      // Intrinsic size the browser uses for the very first paint, before the
      // WebGL effect below has run its own resize() a frame later. Same
      // 1889x1913 crop as the fallback <img>, so `w-auto h-full` sizes it
      // identically to the non-liquid path with no flash.
      width={1889}
      height={1913}
      className={className}
    />
  )
})
