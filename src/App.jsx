import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Cursor } from './components/Cursor'
import { KineticScroll } from './components/KineticScroll'
import { IntroLoader } from './components/IntroLoader'
import { useLenis } from './lib/useLenis'
import { ScrollTrigger } from './lib/gsap'
import Home from './pages/Home'
import Work from './pages/Work'
import About from './pages/About'

// Per-route SEO: title, description, and canonical follow the route (crawlers
// that execute JS pick these up; the defaults in index.html cover the rest).
const ROUTE_META = {
  '/': {
    title: 'Abishai Gosula — Founder, builder & CS student',
    description:
      'Abishai Gosula — a 21-year-old founder and computer-science student, leading teams and shipping products people remember. Founder of Elsheph Systems; built synth, GMV Live, Benji, and Atlitos; Berkeley SkyDeck.',
  },
  '/work': {
    title: 'Work — Abishai Gosula',
    description:
      'Selected work by Abishai Gosula: synth, GMV Live, Benji, Atlitos, Elsheph Systems, and an AIoT air hockey assistant. Founder-led products across sports tech and AI.',
  },
  '/about': {
    title: 'About — Abishai Gosula',
    description:
      'About Abishai Gosula: founder and CS student from Hyderabad, building at the intersection of AI, embedded vision, and software. SRM, UC Berkeley Startup Semester, Berkeley SkyDeck.',
  },
}

function RouteMeta() {
  const location = useLocation()
  useEffect(() => {
    const meta = ROUTE_META[location.pathname] || ROUTE_META['/']
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `https://abishaigosula.com${location.pathname === '/' ? '/' : location.pathname}`)
  }, [location.pathname])
  return null
}

// Fade/slide page transitions via Framer Motion; GSAP owns scroll-scrubbing inside pages.
function Page({ children }) {
  const reduce = useReducedMotion()
  return (
    <motion.main
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
      transition={{ duration: reduce ? 0.2 : 0.5, ease: [0.165, 0.84, 0.44, 1] }}
    >
      {children}
    </motion.main>
  )
}

export default function App() {
  const location = useLocation()
  useLenis()

  // Reset scroll + refresh ScrollTriggers on route change.
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    const id = setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => clearTimeout(id)
  }, [location.pathname])

  return (
    <>
      <IntroLoader />
      <RouteMeta />
      {/* Phones held sideways get a portrait prompt instead of a broken
          landscape layout (CSS-only; see .rotate-guard in index.css). The
          installed PWA is locked via the manifest's orientation field. */}
      <div className="rotate-guard" aria-hidden="true">
        <span className="rotate-guard-icon">↺</span>
        <p>Please rotate your phone</p>
        <p className="rotate-guard-sub">This site is best viewed in portrait</p>
      </div>
      <Cursor />
      <KineticScroll />
      <Nav />
      {/* page content is a sheet over the footer; scrolling to the end lifts it
          (rounded bottom + shadow) to reveal the fixed footer layer beneath. */}
      <div className="relative z-10 mb-[100svh] rounded-b-[2.5rem] bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.4)]">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/work" element={<Page><Work /></Page>} />
            <Route path="/about" element={<Page><About /></Page>} />
          </Routes>
        </AnimatePresence>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-0 h-[100svh]">
        <Footer />
      </div>
    </>
  )
}
