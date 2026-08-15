/*
  The site's primary routes, in nav order.

  Header and footer both read this list, so adding a route — or reordering one —
  is a single edit rather than two that can drift apart.

  `/about` and `/contact` are placeholder pages until step 8 builds them. They
  exist because a nav link that 404s is worse than a thin page, and because the
  keyboard and reduced-motion checks in step 4b need somewhere to navigate to.
*/
export const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

/** Astro's built output carries a trailing slash where the dev server doesn't. */
function normalise(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

/**
 * What `aria-current` a nav link should carry on the page being rendered.
 *
 * `page` for the exact route, `true` for an ancestor of it — which is what
 * `/work/<slug>` needs, since a project page isn't `/work` but Work is the
 * section you are in. Both values are valid ARIA.
 *
 * The styling hangs off this same attribute, so what a screen reader hears and
 * what a sighted reader sees can't drift apart.
 */
export function currentFor(
  href: string,
  pathname: string
): 'page' | 'true' | undefined {
  const path = normalise(pathname);
  const target = normalise(href);

  if (path === target) return 'page';

  // Skipped for '/', which is an ancestor of every page on the site.
  if (target !== '/' && path.startsWith(`${target}/`)) return 'true';

  return undefined;
}
