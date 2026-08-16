/**
 * The card a shared link shows — Open Graph and Twitter both read it.
 *
 * Two kinds, one shape. The site's own pages use a composed card that carries
 * her name; a project page uses that project's hero photograph, which is what
 * the link is actually about. `BaseLayout` renders whichever it is given and
 * makes the URL absolute.
 */
import { getImage } from 'astro:assets';

import type { Project } from './projects';

export interface SocialImage {
  /** Root-relative; `BaseLayout` resolves it against `Astro.site`. */
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** 1.91:1 — what every scraper crops to, so the card is composed at it. */
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

/**
 * The site card, drawn by `scripts/make-og.mjs` and committed to `public/og/`.
 *
 * It is a composition — her name, the rule, the standfirst and a photograph —
 * so it can't be derived from an image at build time the way a project's can.
 * Re-run that script if the identity or the lead photograph changes.
 */
export const SITE_CARD: SocialImage = {
  src: '/og/card.jpg',
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  alt: 'Lea Kassem, Interior Architect — residential interiors across the UAE, Qatar and Lebanon.',
};

/**
 * A project's own card: its hero, cropped to 1.91:1 at build time.
 *
 * Deliberately generated at the full 1200px even though most heroes are
 * narrower than that (the crops run 539–1314px — open item 1). The variant
 * ladder on the page stops at the source width because a bigger soft crop is
 * no better than the crop; a social card is the one place where that trade
 * runs the other way, since a card under about 600px wide is shown as a small
 * thumbnail rather than a large one. When Lea's originals land the upscale
 * disappears on its own.
 *
 * JPEG rather than the AVIF/WebP `Media` prefers: this file is fetched by
 * scrapers, not by browsers, and some of them still take neither.
 */
export async function socialImageFor(project: Project): Promise<SocialImage> {
  const hero = project.data.hero;
  if (!hero) return SITE_CARD;

  const card = await getImage({
    src: hero.src,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fit: 'cover',
    format: 'jpeg',
    quality: 80,
  });

  return {
    src: card.src,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alt: hero.alt,
  };
}
