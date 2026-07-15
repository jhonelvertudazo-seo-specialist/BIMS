import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://<user>.github.io/BIMS/ on GitHub Pages, so assets
// need that subpath as their base — but local dev/build should still work
// at the site root. The Pages deploy workflow sets GITHUB_PAGES=true.
export default defineConfig({
    base: process.env.GITHUB_PAGES ? '/BIMS/' : '/',
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.js'],
    },
});
