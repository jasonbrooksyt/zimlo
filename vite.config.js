import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Zimlo - Jo Chaho, Jahan Chaho, Zimlo Laayega',
        short_name: 'Zimlo',
        description: 'Hyperlocal on-demand delivery for small towns',
        theme_color: '#FF9800',
        background_color: '#FFF8F0',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Do NOT serve index.html for API / static backend routes
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.zimlo\.in\/api\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
})
