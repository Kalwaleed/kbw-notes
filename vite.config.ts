import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

// Dev-server fallback so /kbw-notes/* deep links serve the SPA shell.
// In production, Vercel handles this via vercel.json rewrites.
function kbwNotesDevRewrite(): Plugin {
  return {
    name: 'kbw-notes-dev-rewrite',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url || ''
        if (url.startsWith('/kbw-notes') && !url.includes('.')) {
          req.url = '/kbw-notes/index.html'
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), kbwNotesDevRewrite()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
        app:     resolve(__dirname, 'kbw-notes/index.html'),
      },
      output: {
        // Split stable vendors out of the app chunk so page edits don't bust
        // the whole bundle's cache; route chunks come from router.tsx `lazy`.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/@supabase')) return 'supabase-vendor'
          return undefined
        },
      },
    },
  },
  server: {
    allowedHosts: ['host.docker.internal'],
  },
})
