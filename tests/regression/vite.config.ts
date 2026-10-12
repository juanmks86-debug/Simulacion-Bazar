import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Bundle IIFE solo para la prueba de regresión (se ejecuta dentro de jsdom)
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: process.env.OUT || 'dist-regression',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: { entry: 'src/main.tsx', name: 'BazarApp', formats: ['iife'], fileName: () => 'app.js' },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
