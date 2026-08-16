/*
  Generate the site's social card — `public/og/card.jpg`, 1200×630.

  What a link to this site looks like when it is pasted into a message is the
  first thing most people will see of it, so the card is the home page's first
  screen rather than a bare photograph: the white card on the grey ground, the
  rule with PORTFOLIO set vertically, her name at display size, and one
  interior photograph as a band across the foot.

  Why Chrome and not sharp: the card has to be set in Inter Variable with the
  site's own tokens and tracking. Chrome already renders that — sharp would
  need the font installed system-wide and would still lay it out differently
  from the page it is quoting. The page below is built from the same values as
  `src/styles/global.css`; it is a quotation of the design system, not a second
  copy of it, and it is 40 lines rather than the whole stylesheet because a
  1200×630 card has no responsive behaviour to reproduce.

  Run it when the identity or the lead photograph changes:

    node scripts/make-og.mjs

  The output is committed, unlike everything else Chrome produces here — a
  crawler fetches it from `/og/card.jpg`, so it has to exist in the repo. It is
  the one image on the site that is not built by `astro:assets`, because the
  card is a composition rather than a photograph.
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { openPage, sleep } from './lib/chrome.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'og', 'card.jpg');
const WORK = path.join(ROOT, '.shots');
// Outside the project tree — see the note in scripts/shoot.mjs.
const PROFILE = path.join(os.tmpdir(), 'lea-portfolio-og-profile');
const PORT = 9334;

const WIDTH = 1200;
const HEIGHT = 630;

/*
  The lead photograph, and the reason it is this one: at 1314px 3B apartment's
  hero is the largest and sharpest crop on the site, which is also why the home
  page's first screen uses it (see LEAD in src/pages/index.astro). It lands in
  the card's foot band at roughly native width, so nothing is upscaled.
*/
const PHOTO = path.join(ROOT, 'src/assets/projects/3b-apartment/hero.jpg');
const FONT = path.join(ROOT, 'src/assets/fonts/inter-latin-variable.woff2');

const dataUrl = (file, mime) =>
  `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: 'Inter Variable';
        font-weight: 100 900;
        font-display: block;
        src: url('${dataUrl(FONT, 'font/woff2')}') format('woff2-variations');
      }

      /* Quoted from src/styles/global.css — see the note at the top. */
      :root {
        --paper: #ffffff;
        --ground: #e8e8e8;
        --ink: #0a0a0a;
        --muted: #666666;
      }

      * { margin: 0; padding: 0; box-sizing: border-box; }

      body {
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        display: flex;
        padding: 28px;
        background: var(--ground);
        color: var(--ink);
        font-family: 'Inter Variable', sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      .card {
        flex: 1;
        display: grid;
        grid-template-rows: auto 1fr;
        overflow: hidden;
        background: var(--paper);
      }

      /*
        The band is given a height rather than taking the text's, so the rule
        has something to run down. At the text's own height it came out as a
        20px tick above the label, which reads as a stray mark rather than as
        the signature rule.
      */
      .top { display: flex; gap: 40px; min-height: 252px; padding: 48px 56px 44px; }

      /* The signature left rule with its label set vertically, as VerticalRule. */
      .rule { display: flex; flex-direction: column; align-items: center; gap: 20px; }
      .rule .line { width: 1px; flex: 1; background: var(--ink); }
      .rule .label {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .text { flex: 1; display: flex; align-items: flex-end; justify-content: space-between; gap: 48px; }

      h1 {
        font-size: 92px;
        font-weight: 700;
        line-height: 0.88;
        letter-spacing: -0.035em;
      }

      .title {
        margin-top: 18px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .standfirst {
        max-width: 330px;
        font-size: 17px;
        line-height: 1.45;
        color: var(--muted);
      }

      img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 80%; display: block; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="top">
        <div class="rule"><span class="line"></span><span class="label">Portfolio</span></div>

        <div class="text">
          <div>
            <h1>Lea&nbsp;Kassem</h1>
            <p class="title">Interior Architect</p>
          </div>

          <p class="standfirst">
            Residential interiors across the UAE, Qatar and Lebanon — concept
            design and technical drawings through to delivery on site.
          </p>
        </div>
      </div>

      <img src="${dataUrl(PHOTO, 'image/jpeg')}" alt="" />
    </div>
  </body>
</html>`;

fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const source = path.join(WORK, 'og-card.html');
fs.writeFileSync(source, html);

const { page, close } = await openPage({ port: PORT, profile: PROFILE, allowFile: true });

try {
  await page.send('Page.enable');
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    // 2× and downsampled by the JPEG encoder would be sharper, but a card is
    // read at thumbnail size in a chat window and the file has to stay small.
    deviceScaleFactor: 1,
    mobile: false,
  });

  const loaded = page.once('Page.loadEventFired');
  await page.send('Page.navigate', { url: `file:///${source.replace(/\\/g, '/')}` });
  await loaded;
  // The font is `font-display: block`, so give it a moment to arrive rather
  // than photographing the fallback.
  await sleep(1200);

  const shot = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 86 });
  fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
} finally {
  await close();
}

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`wrote ${path.relative(ROOT, OUT)} — ${WIDTH}×${HEIGHT}, ${kb} KB`);
