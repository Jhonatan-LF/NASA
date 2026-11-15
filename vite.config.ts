import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas: el juego funciona publicado en cualquier carpeta (GitHub Pages)
  base: './',
  plugins: [react()],
})
