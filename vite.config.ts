import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base ('./') makes the built asset URLs relative, so the app works
// from ANY GitHub Pages subpath (https://user.github.io/<repo>/) without having
// to hardcode the repo name. Combined with the single-view (no client router)
// architecture, this avoids the classic Pages deep-link 404 problem.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
