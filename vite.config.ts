import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-stylesheets', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-webfonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      manifest: {
        name: 'ShopReady | Service Bay Software',
        short_name: 'ShopReady',
        description: 'Premium Auto Repair Management & Diagnostic Portal',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        categories: ['business', 'productivity', 'utilities'],
        icons: [
          { src: 'icons/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Shop Board',
            url: '/s/board',
            icons: [{ src: 'icons/icon.png', sizes: '192x192' }],
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
