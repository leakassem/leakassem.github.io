/*
  Generate `public/apple-touch-icon.png` from `public/favicon.svg`.

    node scripts/make-icons.mjs

  iOS ignores an SVG favicon: a page saved to the home screen either finds a
  180×180 PNG at this name or gets a screenshot of the page instead. Sharp is
  already a dependency (Astro's image pipeline), and the favicon is drawn as
  rectangles rather than text, so nothing here needs a font.

  Flattened onto the light ground on purpose. The SVG inverts under
  `prefers-color-scheme: dark`; an iOS home screen has no such thing, and a
  transparent PNG there is composited onto whatever the wallpaper happens to
  be. Re-run this if the mark changes.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'public', 'favicon.svg');
const OUT = path.join(ROOT, 'public', 'apple-touch-icon.png');
const SIZE = 180;

await sharp(fs.readFileSync(SOURCE), { density: 384 })
  .resize(SIZE, SIZE)
  .flatten({ background: '#ffffff' })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const bytes = fs.statSync(OUT).size;
console.log(`wrote ${path.relative(ROOT, OUT)} — ${SIZE}×${SIZE}, ${bytes} bytes`);
