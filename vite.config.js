import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Build a static SPA into dist/ for trivial hosting (Vercel/Netlify/any static host).
// PWA: precache the app shell + images/fonts, but NEVER the videos (multi-MB;
// they stream on demand with a runtime cache instead).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'og-image.jpg'],
      manifest: {
        name: 'Abishai Gosula',
        short_name: 'Abishai',
        description: 'Founder, builder and CS student.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // never serve the SPA shell for real files (PDF resume, media): on
        // phones these are navigations and the fallback broke the download
        navigateFallbackDenylist: [/\.(pdf|mp4|jpg|png|webp|webmanifest|xml|txt)$/i, /^\/assets\//],
        globPatterns: ['**/*.{js,css,html,svg,webp,woff2}'],
        globIgnores: ['**/assets/video/**', '**/assets/img/**'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/img\/.*\.(jpg|png|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/assets\/video\/.*\.mp4$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'videos',
              rangeRequests: true,
              expiration: { maxEntries: 6, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: { port: 5173, open: true },
  build: { outDir: 'dist', sourcemap: false },
})
