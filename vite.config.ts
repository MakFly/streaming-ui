import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  server: { port: 5173 },
  build: {
    // The Prompt dialog rebuilds each demo from `run.toString()` and its helpers' source, so the demo modules must
    // reach the browser exactly as written:
    // - no minify, and target esnext so esbuild never re-prints the chunks;
    // - Vite 7 (Rollup keeps source text as written; Vite 8 / Rolldown regenerates code), hence the pinned major;
    // - no tree-shaking: Rollup also prunes inside function bodies (unused arguments, dead locals, and even calls it
    //   wrongly deems pure, e.g. ReUI's timeline step badges), which changed both the prompts and the demos.
    target: 'esnext',
    minify: false,
    rollupOptions: { treeshake: false },
    chunkSizeWarningLimit: 4000,
  },
});
