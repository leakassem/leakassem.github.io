// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Drives canonical links and the sitemap. Update if a custom domain is added.
  site: 'https://leakassem.github.io',

  // User site (repo must be named exactly `leakassem.github.io`), so the site is
  // served from the root. Base stays '/' even after a custom domain is added.
  base: '/',

  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },
});
