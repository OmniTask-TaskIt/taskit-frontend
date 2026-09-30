import react from '@vitejs/plugin-react'
// `defineConfig` se importa de "vitest/config" (en vez de "vite") porque re-exporta
// el mismo helper de Vite con el tipo extendido para aceptar el bloque `test` de
// abajo; así queda un único archivo de config para dev/build y para Vitest.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // Vite solo expone al cliente las variables de entorno que empiezan por uno
  // de estos prefijos. Se agrega "VIT_" porque en Vercel el nombre
  // "VITE_GITHUB_CLIENT_ID" no se pudo registrar y se dejó como
  // "VIT_GITHUB_CLIENT_ID" (ver README, sección de variables de entorno).
  envPrefix: ['VITE_', 'VIT_'],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
