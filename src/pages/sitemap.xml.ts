import type { APIRoute } from 'astro';

import { NAV } from '../lib/nav';
import { getProjects, hrefOf } from '../lib/projects';

/**
 * The sitemap, built from the same data the pages are.
 *
 * Written out rather than adding `@astrojs/sitemap`, for the reason the deploy
 * workflow is written out: there are 21 URLs and every one of them is already
 * derivable here. The routes come from `NAV`, so a fourth route appears in the
 * sitemap the moment the header links to it, and the project URLs come from
 * `hrefOf()`, so they cannot disagree with what the cards link to.
 *
 * `/styleguide` is deliberately absent — it is an internal reference and
 * carries a `noindex` of its own. So is `/404`.
 *
 * No `lastmod`, `changefreq` or `priority`. A static build has no honest value
 * for the first (every page would claim the deploy date), and Google ignores
 * the other two.
 */
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('sitemap: `site` is unset in astro.config.mjs');

  const projects = await getProjects();
  const paths = ['/', ...NAV.map((item) => item.href), ...projects.map(hrefOf)];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
