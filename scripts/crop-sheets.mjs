/**
 * Crop the individual photos out of the portfolio sheet composites.
 *
 *   node scripts/crop-sheets.mjs            # write crops
 *   node scripts/crop-sheets.mjs --dry-run  # detect and report, write nothing
 *
 * Reads  src/assets/sheets/NN-*.jpg   — full-page composites from the source PDF
 * Writes src/assets/projects/<slug>/  — hero.jpg + gallery-NN.jpg
 *
 * Each sheet is a white page carrying a left text column and a grid of photos.
 * The photos are separated by white gutters, so a recursive XY-cut — the
 * classic document-layout split — finds them without any hand-measured
 * coordinates. Two things the cut can't decide on its own are configured
 * below: which detections aren't photographs (DROP), and which photo leads a
 * project (HERO).
 *
 * This is a one-time pipeline that exists to be re-runnable, not a build step.
 * When Lea's original renders arrive (open item 1 in work.md) the whole thing
 * is replaced by dropping files into src/assets/projects/<slug>/ under the same
 * names — no content or layout change. That is the point of naming crops by
 * slug and role rather than by sheet number or crop box.
 *
 * sharp is used because Astro already depends on it; re-running this needs no
 * install beyond `npm install`.
 */

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SHEETS = 'src/assets/sheets';
const OUT = 'src/assets/projects';

/* ------------------------------------------------------------------ config */

/** Which project each source sheet belongs to. Sheet numbers are the PDF pages. */
const SHEET_PROJECT = {
  2: 'ad-villa',
  3: 'ad-villa',
  4: 'difc-apartment',
  5: 'difc-apartment',
  6: 'difc-apartment',
  7: 'k1-villa',
  8: 'fg-villa',
  9: 'vbm-villa',
  10: 'vbm-villa',
  11: '3b-apartment',
  12: 'az-triplex',
  13: 'az-triplex',
  14: 'qatar-villa',
  15: 'qatar-villa',
  16: '8b2-studio-apartment',
  17: 'b11-apartment',
  18: '3bf-apartment',
  19: 'mma-apartment',
  20: 'faqra-duplex-chalet',
  21: 'vacation-house-byblos',
  22: 'mn-apartment',
  23: 'jcl-apartment',
  24: 'rj-apartment',
};

/**
 * Detections that shouldn't reach the gallery.
 *
 * The cut can only see "a block of ink surrounded by white". It can't tell a
 * render from an elevation drawing, and it can't tell that two boxes hold the
 * same picture. Three things get dropped, and nothing else:
 *
 *   1. Drawings — line elevations and washed-out study elevations that read as
 *      diagrams next to a perspective render.
 *   2. Reprints — the small preview some sheets put in their text column, when
 *      it is the same picture as one already in the grid.
 *   3. A watermarked twin — sheet 6 prints its door render twice, once tighter
 *      with "THE DIFC PROJECT" burned into the pixels. The wider one is clean
 *      and shows strictly more, so the branded crop has no reason to survive.
 *
 * What is *not* dropped is a text-column picture that appears nowhere else —
 * most of them, as it turns out — or a sheet whose content genuinely is
 * elevations. VBM villa's sheet 10 is five full-width joinery elevations; that
 * is the work the sheet is presenting, not page furniture.
 *
 * Boxes are matched by overlap, not by index, so re-running after a tweak to
 * the detector can't silently drop the wrong thing.
 */
const DROP = [
  { sheet: 5, box: [612, 282, 836, 503], why: 'faded bedroom elevation study' },
  { sheet: 6, box: [986, 94, 1683, 563], why: 'door render again, "THE DIFC PROJECT" burned in' },
  { sheet: 6, box: [204, 229, 528, 557], why: 'bathroom elevation drawing' },
  { sheet: 6, box: [598, 229, 814, 557], why: 'bathroom elevation drawing' },
  { sheet: 7, box: [339, 205, 770, 394], why: 'kitchen elevation line drawing' },
  { sheet: 7, box: [195, 436, 446, 596], why: 'kitchen elevation line drawing' },
  { sheet: 8, box: [199, 241, 608, 451], why: 'elevation of the wall the grid already shows in perspective' },
  { sheet: 16, box: [197, 223, 634, 550], why: 'text-column reprint of the living room render' },
  { sheet: 19, box: [1248, 203, 1791, 622], why: 'same view as its neighbour, bar the wall-unit TV' },
  { sheet: 22, box: [196, 236, 624, 525], why: 'text-column reprint of the neon-sign bedroom' },
];

/**
 * The photo that leads each project.
 *
 * Editorial, and deliberately so — picking by size alone hands VBM villa a
 * flat wardrobe elevation over its living room, which is the wrong first
 * impression. See open item 11 in work.md: Lea should confirm these.
 *
 * Each is `[sheet, box]`; the box is the detected photo, cropped to 2:1 for
 * the hero. The same photo also stays in the gallery — the detail page shows
 * it large at the top, and a viewer opening the gallery shouldn't find a gap
 * where the image they just saw should be.
 */
const HERO = {
  'ad-villa': [2, [850, 627, 1622, 1142]],
  'difc-apartment': [4, [1565, 94, 2383, 671]],
  'k1-villa': [7, [813, 623, 1592, 1141]],
  'fg-villa': [8, [1493, 550, 2383, 1143]],
  'vbm-villa': [9, [799, 236, 1590, 665]],
  '3b-apartment': [11, [850, 96, 2387, 755]],
  'az-triplex': [12, [1656, 92, 2379, 604]],
  'qatar-villa': [15, [972, 93, 2387, 643]],
  '8b2-studio-apartment': [16, [1683, 84, 2385, 606]],
  'b11-apartment': [17, [1020, 96, 2390, 751]],
  '3bf-apartment': [18, [933, 90, 1704, 533]],
  'mma-apartment': [19, [682, 203, 1225, 622]],
  'faqra-duplex-chalet': [20, [955, 84, 1688, 608]],
  'vacation-house-byblos': [21, [746, 96, 1575, 722]],
  'mn-apartment': [22, [1637, 79, 2388, 612]],
  'jcl-apartment': [23, [1620, 92, 2387, 633]],
  'rj-apartment': [24, [864, 96, 1932, 1140]],
};

/** A photo must be at least this big to be one. Smaller blocks are page furniture. */
const MIN_PHOTO = 150;
/** A gutter is a run of rows or columns at least this white... */
const GUTTER_WHITE = 0.93;
/** ...and at least this many pixels thick. Some sheets butt photos up at 3px. */
const GUTTER_MIN = 3;
/** Shave the edge of every crop, so no sliver of the neighbouring gutter rides along. */
const INSET = 2;
/** Hero aspect. Crops top out near 1500px wide, so a 2:1 band beats a full bleed. */
const HERO_RATIO = 2;

/* --------------------------------------------------------------- detection */

/**
 * A white-pixel mask plus its integral image, so the white fraction of any
 * row or column span is O(1) — the recursion asks for thousands of them.
 */
function whiteField(data, width, height, channels) {
  const mask = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < mask.length; i++, p += channels) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const max = r > g ? (r > b ? r : b) : g > b ? g : b;
    const min = r < g ? (r < b ? r : b) : g < b ? g : b;
    // Paper white, not "a bright surface in the photo": high and unsaturated.
    mask[i] = min >= 240 && max - min <= 12 ? 1 : 0;
  }

  // sum[y][x] = white pixels above and left of (x, y)
  const stride = width + 1;
  const sum = new Int32Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let run = 0;
    for (let x = 0; x < width; x++) {
      run += mask[y * width + x];
      sum[(y + 1) * stride + x + 1] = sum[y * stride + x + 1] + run;
    }
  }

  const area = (x0, y0, x1, y1) =>
    sum[y1 * stride + x1] - sum[y0 * stride + x1] - sum[y1 * stride + x0] + sum[y0 * stride + x0];

  return {
    width,
    height,
    /** White fraction of column `x`, between rows y0 and y1. */
    col: (x, y0, y1) => area(x, y0, x + 1, y1) / (y1 - y0),
    /** White fraction of row `y`, between columns x0 and x1. */
    row: (y, x0, x1) => area(x0, y, x1, y + 1) / (x1 - x0),
    /** White fraction of a whole box. */
    box: (x0, y0, x1, y1) => area(x0, y0, x1, y1) / ((x1 - x0) * (y1 - y0)),
  };
}

/** Runs of `[start, end)` where `at(i)` is at least `thresh`, at least `minLen` long. */
function gutters(from, to, at, thresh, minLen) {
  const out = [];
  let start = null;
  for (let i = from; i < to; i++) {
    if (at(i) >= thresh) {
      if (start === null) start = i;
    } else {
      if (start !== null && i - start >= minLen) out.push([start, i]);
      start = null;
    }
  }
  if (start !== null && to - start >= minLen) out.push([start, to]);
  return out;
}

/** Shrink a box until none of its edges is blank paper. */
function trim(field, [x0, y0, x1, y1]) {
  while (x0 < x1 && field.col(x0, y0, y1) >= GUTTER_WHITE) x0++;
  while (x1 > x0 && field.col(x1 - 1, y0, y1) >= GUTTER_WHITE) x1--;
  while (y0 < y1 && field.row(y0, x0, x1) >= GUTTER_WHITE) y0++;
  while (y1 > y0 && field.row(y1 - 1, x0, x1) >= GUTTER_WHITE) y1--;
  return x1 > x0 && y1 > y0 ? [x0, y0, x1, y1] : null;
}

/**
 * Recursive XY-cut: trim the region to its ink, split it on the widest run of
 * whitespace crossing it, and recurse. A region with no whitespace crossing it
 * is a leaf — one photo.
 */
function xycut(field, region, minSide = 40) {
  const box = trim(field, region);
  if (!box) return [];
  const [x0, y0, x1, y1] = box;
  if (x1 - x0 < minSide || y1 - y0 < minSide) return [];

  const cols = gutters(x0 + 1, x1 - 1, (x) => field.col(x, y0, y1), GUTTER_WHITE, GUTTER_MIN);
  const rows = gutters(y0 + 1, y1 - 1, (y) => field.row(y, x0, x1), GUTTER_WHITE, GUTTER_MIN);
  if (!cols.length && !rows.length) return [box];

  const widest = (runs) => runs.reduce((best, r) => Math.max(best, r[1] - r[0]), 0);
  const vertical = widest(cols) >= widest(rows);
  const cuts = vertical ? cols : rows;
  const lo = vertical ? x0 : y0;
  const hi = vertical ? x1 : y1;

  // Edges alternate content, gutter, content, gutter, ... content.
  const edges = [lo, ...cuts.flat(), hi];
  const out = [];
  for (let i = 0; i < edges.length - 1; i += 2) {
    const [a, b] = [edges[i], edges[i + 1]];
    out.push(...xycut(field, vertical ? [a, y0, b, y1] : [x0, a, x1, b], minSide));
  }
  return out;
}

/** Fraction of the smaller box that the two share. 1 means one contains the other. */
function overlap(a, b) {
  const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
  const h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  if (w <= 0 || h <= 0) return 0;
  const areaOf = (x) => (x[2] - x[0]) * (x[3] - x[1]);
  return (w * h) / Math.min(areaOf(a), areaOf(b));
}

/** Every photograph on one sheet, in reading order. */
function photosOf(field, sheet) {
  // The page card: the only part of the sheet that is mostly paper. Outside it
  // is the bleed image the page is laid over, which is never near-white.
  let cx0 = 0;
  let cx1 = field.width;
  let cy0 = 0;
  let cy1 = field.height;
  while (cx0 < cx1 && field.col(cx0, 0, field.height) <= 0.4) cx0++;
  while (cx1 > cx0 && field.col(cx1 - 1, 0, field.height) <= 0.4) cx1--;
  while (cy0 < cy1 && field.row(cy0, 0, field.width) <= 0.4) cy0++;
  while (cy1 > cy0 && field.row(cy1 - 1, 0, field.width) <= 0.4) cy1--;

  const dropped = DROP.filter((d) => d.sheet === sheet);

  return xycut(field, [cx0, cy0, cx1, cy1])
    .filter((b) => {
      const [x0, y0, x1, y1] = b;
      if (x1 - x0 < MIN_PHOTO || y1 - y0 < MIN_PHOTO) return false;
      // A photograph is ink edge to edge. Text and drawings are mostly paper.
      if (field.box(x0, y0, x1, y1) >= 0.3) return false;
      return !dropped.some((d) => overlap(b, d.box) > 0.8);
    })
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

/* ----------------------------------------------------------------- cropping */

/** The largest centred `ratio` box that fits inside a detected photo. */
function toRatio([x0, y0, x1, y1], ratio) {
  let w = x1 - x0;
  let h = y1 - y0;
  if (w / h > ratio) {
    const want = Math.round(h * ratio);
    x0 += Math.floor((w - want) / 2);
    w = want;
  } else {
    const want = Math.round(w / ratio);
    y0 += Math.floor((h - want) / 2);
    h = want;
  }
  return [x0, y0, x0 + w, y0 + h];
}

async function crop(source, [x0, y0, x1, y1], out) {
  await sharp(source)
    .extract({
      left: x0 + INSET,
      top: y0 + INSET,
      width: x1 - x0 - INSET * 2,
      height: y1 - y0 - INSET * 2,
    })
    // These are already JPEGs; 92 keeps the second encode from showing. Astro
    // re-encodes to AVIF/WebP at build time, so this file is only ever a master.
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(out);
}

/* --------------------------------------------------------------------- main */

const dryRun = process.argv.includes('--dry-run');

const files = (await readdir(SHEETS)).filter((f) => f.endsWith('.jpg')).sort();
const byProject = new Map();

for (const file of files) {
  const sheet = Number(file.slice(0, 2));
  const slug = SHEET_PROJECT[sheet];
  if (!slug) throw new Error(`Sheet ${sheet} (${file}) is not mapped to a project`);

  const source = path.join(SHEETS, file);
  const { data, info } = await sharp(source).raw().toBuffer({ resolveWithObject: true });
  const field = whiteField(data, info.width, info.height, info.channels);
  const photos = photosOf(field, sheet);

  if (!byProject.has(slug)) byProject.set(slug, []);
  byProject.get(slug).push(...photos.map((box) => ({ sheet, source, box })));
  console.log(`${file}  ${photos.length} photos`);
}

const manifest = [];

for (const [slug, photos] of byProject) {
  const dir = path.join(OUT, slug);
  if (!dryRun) {
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
  }

  const pick = HERO[slug];
  if (!pick) throw new Error(`No hero configured for ${slug}`);
  const hero = photos.find((p) => p.sheet === pick[0] && overlap(p.box, pick[1]) > 0.8);
  if (!hero) throw new Error(`Hero for ${slug} matches no detected photo on sheet ${pick[0]}`);

  const entries = [];
  const heroBox = toRatio(hero.box, HERO_RATIO);
  entries.push({ file: 'hero.jpg', ...hero, box: heroBox });
  photos.forEach((p, i) =>
    entries.push({ file: `gallery-${String(i + 1).padStart(2, '0')}.jpg`, ...p }),
  );

  for (const entry of entries) {
    const [x0, y0, x1, y1] = entry.box;
    entry.width = x1 - x0 - INSET * 2;
    entry.height = y1 - y0 - INSET * 2;
    if (!dryRun) await crop(entry.source, entry.box, path.join(dir, entry.file));
  }

  manifest.push({ slug, entries: entries.map(({ source, ...e }) => e) });
  const sizes = entries.map((e) => `${e.file} ${e.width}x${e.height}`).join('  ');
  console.log(`\n${slug}\n  ${sizes}\n`);
}

if (!dryRun) {
  await writeFile(
    path.join(OUT, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
}

const total = manifest.reduce((n, p) => n + p.entries.length, 0);
console.log(`${manifest.length} projects, ${total} images${dryRun ? ' (dry run)' : ''}`);
