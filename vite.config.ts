import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Plugin to remove crossorigin attribute which causes MIME errors in some extension contexts
const removeCrossorigin = () => {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html: string) {
      return html.replace(/\scrossorigin/g, '')
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), removeCrossorigin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    modulePreload: false,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
})
