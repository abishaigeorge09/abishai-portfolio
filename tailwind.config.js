/** @type {import('tailwindcss').Config} */
// Brand tokens live here so palette / fluid type / spring easings are reusable utilities.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x-rgb) / <alpha-value>) keeps opacity modifiers (bg-peach/60,
        // text-ink/70, …) working while letting `.theme-mono` (tokens.css)
        // retarget every one of these utilities to black/white/gray at once.
        cream: 'rgb(var(--cream-rgb) / <alpha-value>)',
        peach: 'rgb(var(--peach-rgb) / <alpha-value>)',
        blue: 'rgb(var(--blue-rgb) / <alpha-value>)',
        'gray-warm': 'rgb(var(--gray-warm-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
      },
      fontFamily: {
        // --font-display defaults to a free geometric/rounded heavy face.
        // TODO: swap for licensed "Goga" by dropping woff2 into assets/fonts/ and
        // updating the @font-face + --font-display var in src/styles/tokens.css.
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Arial', 'system-ui', 'sans-serif'],
        // Hero arched headline only. Loaded via index.html Google Fonts link.
        anton: ['Anton', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Giant fluid hero name up to ~228px on desktop.
        giant: ['clamp(4.5rem, 18vw, 14.25rem)', { lineHeight: '0.86', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.5rem, 7vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 5vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.015em' }],
      },
      transitionTimingFunction: {
        // The exact spring/overshoot beziers from the spec.
        'spring-pill': 'cubic-bezier(0.275, 2.254, 0.281, 0.996)',
        'spring-social': 'cubic-bezier(0.292, 1.932, 0.281, 0.996)',
        'out-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      },
      zIndex: {
        cursor: '910',
        nav: '900',
      },
    },
  },
  plugins: [],
}
