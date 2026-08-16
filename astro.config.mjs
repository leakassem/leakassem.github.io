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

  // GitHub Pages serves `dist/work/index.html` at `/work/` and 301s `/work` to
  // it, so a link written without the slash costs every visitor a redirect
  // round trip. Every internal href carries one now, and this makes `astro dev`
  // 404 a slashless link rather than serving it — so the next one that gets
  // written is caught here instead of becoming a silent redirect in production.
  // (`astro preview` is lenient about it either way.)
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()],
  },
});
