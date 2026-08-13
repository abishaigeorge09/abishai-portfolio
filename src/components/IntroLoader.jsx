// Full-screen three.js intro loader shown once per session before the hero.
// Particles vortex-in, condense into the AG monogram (rasterized from the
// exact AgMark SVG paths), hold with a shimmer, then burst outward while the
// overlay wipes upward to reveal the page. Dispatches `intro:done` when the
// page is visible so the hero can react without this file touching Hero.jsx.
import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

const AG_MARK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 136 100"><g transform="skewX(-8) translate(14 0)" fill="#000"><path d="M2 98 L40 2 H66 V98 H44 V72 H27 L17 98 Z"/><path d="M78 2 H126 V30 H100 V70 H126 V98 H78 Z"/><rect x="106" y="44" width="20" height="26"/></g></svg>'

const PARTICLE_COUNT = 2200
const INK = { r: 0x11, g: 0x11, b: 0x11 }
const BLUE = { r: 0x2e, g: 0x54, b: 0xfe }

const SESSION_KEY = 'introSeen'

// Rasterize the AG mark SVG offscreen and return sample points in a
// normalized [-1, 1] space (x right, y up), preserving aspect ratio.
function sampleGlyphPoints(count) {
  const W = 544
  const H = 400
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, W, H)

  return new Promise((resolve) => {
    const img = new Image()
    const blob = new Blob([AG_MARK_SVG], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      // fit the 136x100 viewBox into the canvas with padding
      const pad = 24
      const scale = Math.min((W - pad * 2) / 136, (H - pad * 2) / 100)
      const dw = 136 * scale
      const dh = 100 * scale
      const dx = (W - dw) / 2
      const dy = (H - dh) / 2
      ctx.drawImage(img, dx, dy, dw, dh)
      URL.revokeObjectURL(url)

      const { data } = ctx.getImageData(0, 0, W, H)
      const dark = []
      for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
          const i = (y * W + x) * 4
          // dark pixel = glyph fill
          if (data[i] < 128 && data[i + 3] > 100) {
            dark.push([x, y])
          }
        }
      }

      const pts = []
      if (dark.length === 0) {
        resolve(pts)
        return
      }
      // Normalize against the DARK-PIXEL bounding box, not the canvas: the
      // skewed glyph's mass is not centered in the canvas, and normalizing
      // against the canvas rendered the mark off-center on screen.
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      for (const [px, py] of dark) {
        if (px < minX) minX = px
        if (px > maxX) maxX = px
        if (py < minY) minY = py
        if (py > maxY) maxY = py
      }
      const cx = (minX + maxX) / 2
      const cy = (minY + maxY) / 2
      const halfSpanX = Math.max(1, (maxX - minX) / 2)
      const halfSpanY = Math.max(1, (maxY - minY) / 2)
      // both axes in units of the glyph's half-width, so true proportions
      // survive when scaled by a single world half-width
      void halfSpanY
      for (let i = 0; i < count; i++) {
        const [px, py] = dark[Math.floor(Math.random() * dark.length)]
        const nx = (px - cx) / halfSpanX
        const ny = -(py - cy) / halfSpanX
        pts.push([nx, ny])
      }
      resolve(pts)
    }
    img.onerror = () => resolve([])
    img.src = url
  })
}

function makeSpriteTexture(THREE) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const grd = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  )
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.6, 'rgba(255,255,255,0.6)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export function IntroLoader() {
  const rootRef = useRef(null)
  const captionRef = useRef(null)
  const doneRef = useRef(false)
  const skipRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = rootRef.current
    if (!root) return

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      window.dispatchEvent(new CustomEvent('intro:done'))
    }

    // Reduced motion: quick fade, no particles.
    if (prefersReducedMotion()) {
      gsap.to(root, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          doneRef.current = true
          root.style.display = 'none'
          window.dispatchEvent(new CustomEvent('intro:done'))
        },
      })
      return
    }

    let cancelled = false
    let rafId = null
    let cleanup = () => {}

    const skipToEnd = () => {
      skipRef.current = true
    }
    window.addEventListener('pointerdown', skipToEnd, { once: true })
    window.addEventListener('keydown', skipToEnd, { once: true })

    ;(async () => {
      const THREE = await import('three')
      if (cancelled) return

      const canvas = document.createElement('canvas')
      canvas.style.position = 'absolute'
      canvas.style.inset = '0'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      root.appendChild(canvas)

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      })
      renderer.setClearColor(0xffffff, 1)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      )
      camera.position.z = 10

      // World-space glyph target box: ~30vw wide, capped 420px, centered at
      // ~38% viewport height (measured from top, converted to world units).
      const worldPerPx = () => {
        const vFov = (camera.fov * Math.PI) / 180
        const worldH = 2 * Math.tan(vFov / 2) * camera.position.z
        return worldH / window.innerHeight
      }

      const computeLayout = () => {
        const wpp = worldPerPx()
        const glyphWidthPx = Math.min(window.innerWidth * 0.3, 420)
        const glyphHalfWidth = (glyphWidthPx * wpp) / 2
        const glyphHalfHeight = glyphHalfWidth * (100 / 136) // matches viewBox aspect
        // viewport top is +worldH/2, 38% down from top:
        const worldH = wpp * window.innerHeight
        const topY = worldH / 2
        const centerY = topY - 0.5 * worldH
        return { glyphHalfWidth, glyphHalfHeight, centerY }
      }

      let layout = computeLayout()

      const texture = makeSpriteTexture(THREE)

      const positions = new Float32Array(PARTICLE_COUNT * 3)
      const colors = new Float32Array(PARTICLE_COUNT * 3)
      const startAngles = new Float32Array(PARTICLE_COUNT)
      const startRadii = new Float32Array(PARTICLE_COUNT)
      const startZ = new Float32Array(PARTICLE_COUNT)
      const seeds = new Float32Array(PARTICLE_COUNT)
      const targets = new Float32Array(PARTICLE_COUNT * 3)
      const burstDirs = new Float32Array(PARTICLE_COUNT * 3)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = 4 + Math.random() * 5
        startAngles[i] = angle
        startRadii[i] = radius
        startZ[i] = (Math.random() - 0.5) * 3
        seeds[i] = Math.random()

        positions[i * 3] = Math.cos(angle) * radius
        positions[i * 3 + 1] = Math.sin(angle) * radius
        positions[i * 3 + 2] = startZ[i]

        const isBlue = Math.random() < 0.4
        const c = isBlue ? BLUE : INK
        colors[i * 3] = c.r / 255
        colors[i * 3 + 1] = c.g / 255
        colors[i * 3 + 2] = c.b / 255

        const burstAngle = Math.random() * Math.PI * 2
        const burstRadius = 1
        burstDirs[i * 3] = Math.cos(burstAngle) * burstRadius
        burstDirs[i * 3 + 1] = Math.sin(burstAngle) * burstRadius
        burstDirs[i * 3 + 2] = (Math.random() - 0.5) * 2
      }

      const setTargetsFromGlyph = (pts) => {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          if (pts.length === 0) {
            targets[i * 3] = 0
            targets[i * 3 + 1] = layout.centerY
            targets[i * 3 + 2] = 0
            continue
          }
          const [nx, ny] = pts[i % pts.length]
          targets[i * 3] = nx * layout.glyphHalfWidth
          targets[i * 3 + 1] = layout.centerY + ny * layout.glyphHalfWidth
          targets[i * 3 + 2] = (Math.random() - 0.5) * 0.3
        }
      }

      const glyphPoints = await sampleGlyphPoints(PARTICLE_COUNT)
      if (cancelled) {
        texture.dispose()
        renderer.dispose()
        return
      }
      setTargetsFromGlyph(glyphPoints)

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      )
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.09,
        map: texture,
        transparent: true,
        opacity: 0.85,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      })

      const points = new THREE.Points(geometry, material)
      scene.add(points)

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        layout = computeLayout()
        setTargetsFromGlyph(glyphPoints)
      }
      window.addEventListener('resize', onResize)

      // Timeline phases (seconds, elapsed):
      const SWIRL_END = 1.1
      const HOLD_END = SWIRL_END + 1.2
      const BURST_DURATION = 0.6

      const clock = new THREE.Clock()
      let phase = 'swirl' // swirl -> hold -> burst
      let burstStart = null
      let wipeTriggered = false

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

      const tick = () => {
        if (cancelled) return
        const elapsed = clock.getElapsedTime()
        const posAttr = geometry.attributes.position

        const skipping = skipRef.current

        if (phase === 'swirl') {
          const t = skipping ? 1 : Math.min(elapsed / SWIRL_END, 1)
          const e = easeOutCubic(t)
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const swirl = startAngles[i] + t * (2 + seeds[i] * 2)
            const r = startRadii[i] * (1 - e) + 0.15 * (1 - e)
            const sx = Math.cos(swirl) * r
            const sy = Math.sin(swirl) * r
            const sz = startZ[i] * (1 - e)
            const tx = targets[i * 3]
            const ty = targets[i * 3 + 1]
            const tz = targets[i * 3 + 2]
            posAttr.array[i * 3] = sx * (1 - e) + tx * e
            posAttr.array[i * 3 + 1] = sy * (1 - e) + ty * e
            posAttr.array[i * 3 + 2] = sz * (1 - e) + tz * e
          }
          posAttr.needsUpdate = true
          if (t >= 1) {
            phase = 'hold'
          }
        } else if (phase === 'hold') {
          const holdT = skipping ? HOLD_END : elapsed
          const shimmer = Math.sin(holdT * 10) * 0.01
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            posAttr.array[i * 3] = targets[i * 3] + shimmer * Math.cos(seeds[i] * 10)
            posAttr.array[i * 3 + 1] =
              targets[i * 3 + 1] + shimmer * Math.sin(seeds[i] * 10)
            posAttr.array[i * 3 + 2] = targets[i * 3 + 2]
          }
          posAttr.needsUpdate = true
          if (skipping || elapsed >= HOLD_END) {
            phase = 'burst'
            burstStart = elapsed
          }
        } else if (phase === 'burst') {
          const bt = Math.min((elapsed - burstStart) / BURST_DURATION, 1)
          const e = bt * bt
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const dist = e * 14
            posAttr.array[i * 3] = targets[i * 3] + burstDirs[i * 3] * dist
            posAttr.array[i * 3 + 1] =
              targets[i * 3 + 1] + burstDirs[i * 3 + 1] * dist
            posAttr.array[i * 3 + 2] = targets[i * 3 + 2] + burstDirs[i * 3 + 2] * dist
          }
          posAttr.needsUpdate = true
          points.rotation.z += 0.02
          material.opacity = 0.85 * (1 - bt)

          if (!wipeTriggered) {
            wipeTriggered = true
            finish()
            gsap.to(captionRef.current, { opacity: 0, duration: 0.3, ease: 'power1.out' })
            gsap.to(root, {
              yPercent: -100,
              duration: 0.6,
              ease: 'power4.inOut',
              onComplete: () => {
                cleanup()
                if (root.parentNode) root.style.display = 'none'
              },
            })
          }
        }

        renderer.render(scene, camera)
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)

      cleanup = () => {
        if (rafId) cancelAnimationFrame(rafId)
        window.removeEventListener('resize', onResize)
        geometry.dispose()
        material.dispose()
        texture.dispose()
        renderer.dispose()
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
      }
    })()

    return () => {
      cancelled = true
      window.removeEventListener('pointerdown', skipToEnd)
      window.removeEventListener('keydown', skipToEnd)
      cleanup()
      if (!doneRef.current) finish()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[999] flex items-end justify-center bg-white"
      style={{ willChange: 'transform, opacity' }}
    >
      <span
        ref={captionRef}
        className="mb-10 font-[Montserrat] text-[11px] font-semibold uppercase tracking-[0.25em] text-ink/70"
      >
        Abishai Gosula
      </span>
    </div>
  )
}
