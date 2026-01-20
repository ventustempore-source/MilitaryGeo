import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // To wymusza zapisanie wszystkich plików JSON i obrazków w pamięci offline
        globPatterns: ['**/*.{js,css,html,json,png,jpg,svg}'],
      },
      manifest: {
        name: 'Mapa Wojskowa PL',
        short_name: 'MilMap',
        description: 'System map wojskowych offline',
        theme_color: '#b71c1c',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})