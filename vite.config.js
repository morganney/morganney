import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      minify: true,
      viteNext: true
    })
  ],
  build: {
    rollupOptions: {
      external: ['react', 'react-dom/client', 'tts-react', '@knighted/jsx/react/lite']
    }
  }
})
