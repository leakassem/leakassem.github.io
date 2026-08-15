/*
  Screenshot and measure the built site at real viewport widths.

  Why this exists: there is no test suite, and `npm run build` passing says
  nothing about whether a header fits at 375px. Steps 2 and 4 both closed with
  "the animations were not watched running — this environment has no browser",
  which turned out to be false; Chrome and Edge are both installed. This is the
  cheapest way to stop that from being carried forward again.

  It drives an installed Chrome (or Edge) over the DevTools Protocol. No
  Puppeteer, no Playwright, no new dependency — the browser is already on the
  machine and CDP is a WebSocket, which Node has built in.

  Why not just `chrome --headless --window-size=375,812`: on Windows the OS
  clamps the window to a minimum width of roughly 500px, so a 375px shot comes
  out at ~500px and silently looks fine. `Emulation.setDeviceMetricsOverride`
  sets the layout viewport exactly, which is the only number worth trusting.

  Usage — `npm run preview` must already be serving on :4321.

    node scripts/shoot.mjs                    every main route at 375/768/1440
    node scripts/shoot.mjs /work              one route
    node scripts/shoot.mjs /work --bottom     scrolled to the footer
    node scripts/shoot.mjs / --reduced        with prefers-reduced-motion
    node scripts/shoot.mjs / --no-js          with JavaScript disabled
    node scripts/shoot.mjs /work --full       the whole page, not just a screen
    node scripts/shoot.mjs --all              every route in dist/
    node scripts/shoot.mjs --widths 375,1440  pick the widths

  PNGs land in `.shots/` (gitignored). Every shot also prints its measurements,
  and the script exits non-zero if any page scrolls sideways — that part is a
  check, not a picture.
*/
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '.shots');
const PROFILE = path.join(OUT, '.chrome-profile');
const BASE = 'http://localhost:4321';
const PORT = 9333;

const DEFAULT_ROUTES = ['/', '/work', '/about', '/contact'];
const DEFAULT_WIDTHS = [375, 768, 1440];

const CHROMES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ args */

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};

const widths = (value('widths') ?? '').split(',').filter(Boolean).map(Number);
const routeArgs = argv.filter((a) => a.startsWith('/'));

/** Every route in dist/, so step 7's project pages need no config here. */
function routesFromDist() {
  const dist = path.join(ROOT, 'dist');
  if (!fs.existsSync(dist)) throw new Error('no dist/ — run `npm run build` first');

  const found = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html') {
        found.push('/' + path.relative(dist, p).split(path.sep).slice(0, -1).join('/'));
      }
    }
  })(dist);
  return found.map((r) => (r === '/' ? '/' : r)).sort();
}

const routes = routeArgs.length
  ? routeArgs
  : flag('all')
    ? routesFromDist()
    : DEFAULT_ROUTES;

const useWidths = widths.length ? widths : DEFAULT_WIDTHS;

/* ------------------------------------------------------------------- cdp */

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
      } else if (msg.method) {
        for (const fn of this.handlers.get(msg.method) ?? []) fn(msg.params);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  /** Resolves on the next occurrence of an event, then unsubscribes. */
  once(method) {
    return new Promise((res) => {
      const list = this.handlers.get(method) ?? [];
      const fn = (p) => {
        this.handlers.set(method, this.handlers.get(method).filter((x) => x !== fn));
        res(p);
      };
      list.push(fn);
      this.handlers.set(method, list);
    });
  }
}

async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });
  return new CDP(ws);
}

/*
  What each shot reports back, so a layout problem shows up as a number rather
  than as something that has to be spotted in a picture. `hOverflow` is the one
  that fails the run: a page that scrolls sideways on a phone is a bug every
  time, and it is invisible in a screenshot that crops at the viewport.
*/
const MEASURE = `JSON.stringify((() => {
  const de = document.documentElement;
  const header = document.querySelector('header');
  const row = header?.firstElementChild;
  const nav = document.querySelector('nav[aria-label="Primary"] ul');
  const wordmark = header?.querySelector('a');
  const wide = [...document.querySelectorAll('body *')]
    .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1)
    .slice(0, 5)
    .map((el) => el.tagName.toLowerCase() + '@' + Math.round(el.getBoundingClientRect().right));
  return {
    vw: window.innerWidth,
    hOverflow: de.scrollWidth - de.clientWidth,
    headerH: Math.round(header?.getBoundingClientRect().height ?? 0),
    headerFits: row ? row.scrollWidth <= row.clientWidth : null,
    stickyTop: Math.round(header?.getBoundingClientRect().top ?? -999),
    navGap: Math.round((nav?.getBoundingClientRect().left ?? 0) - (wordmark?.getBoundingClientRect().right ?? 0)),
    taps: [...new Set([...document.querySelectorAll('.nav-link')].map((a) => Math.round(a.getBoundingClientRect().height)))],
    /*
      Images showing something, with nothing said about what. An <img> with no
      source at all is exempt because it isn't showing anything yet — the
      gallery lightbox ships an empty one and fills in both src and alt from
      the tile that opened it, and once open it is covered by this again.
    */
    imagesNoAlt: [...document.images]
      .filter((i) => i.getAttribute('src') || i.currentSrc)
      .filter((i) => !i.alt).length,
    /*
      Reveal targets currently sitting at opacity 0. Below the fold that is
      normal — the tween hasn't run yet. With JS off or reduced motion on it is
      a bug, because neither should ever hide anything. The caller decides which
      of those it is.
    */
    hiddenReveals: [...document.querySelectorAll('[data-reveal], [data-reveal] > *')]
      .filter((el) => getComputedStyle(el).opacity === '0').length,
    wide,
  };
})())`;

/* ------------------------------------------------------------------ main */

const chrome = CHROMES.find((p) => fs.existsSync(p));
if (!chrome) throw new Error(`no Chrome or Edge found. Tried:\n  ${CHROMES.join('\n  ')}`);

try {
  await fetch(BASE, { signal: AbortSignal.timeout(3000) });
} catch {
  throw new Error(`nothing serving ${BASE} — run \`npm run preview\` in another terminal`);
}

fs.mkdirSync(OUT, { recursive: true });

const proc = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

let failures = 0;

try {
  let version;
  for (let i = 0; i < 60 && !version; i++) {
    try {
      version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.json());
    } catch {
      await sleep(250);
    }
  }
  if (!version) throw new Error('the browser never opened a debugging port');

  const browser = await connect(version.webSocketDebuggerUrl);
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
  const page = await connect(list.find((t) => t.id === targetId).webSocketDebuggerUrl);

  await page.send('Page.enable');
  await page.send('Runtime.enable');
  /*
    Nothing on this site may depend on JavaScript to be readable or navigable:
    the nav has no toggle, and pre-animation states are gated on a class that
    only JS adds, so with JS off nothing should ever be hidden. Runtime.evaluate
    still works while this is set, so the measurements below survive it.
  */
  await page.send('Emulation.setScriptExecutionDisabled', { value: flag('no-js') });
  await page.send('Emulation.setEmulatedMedia', {
    features: [
      {
        name: 'prefers-reduced-motion',
        value: flag('reduced') ? 'reduce' : 'no-preference',
      },
    ],
  });

  for (const route of routes) {
    for (const width of useWidths) {
      await page.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: width < 700 ? 812 : 900,
        // Retina only on the narrow shots, where the type is too small to read
        // back otherwise. A 1440 shot at 2x is 2880px of nothing useful.
        deviceScaleFactor: width < 700 ? 2 : 1,
        mobile: false,
      });

      const loaded = page.once('Page.loadEventFired');
      await page.send('Page.navigate', { url: BASE + route });
      await loaded;
      // Reveals fire on scroll position, and webfonts resplit the headings.
      await sleep(1600);

      if (flag('bottom')) {
        await page.send('Runtime.evaluate', {
          expression: 'window.scrollTo(0, document.body.scrollHeight)',
        });
        await sleep(900);
      }

      const measured = await page.send('Runtime.evaluate', {
        expression: MEASURE,
        returnByValue: true,
      });
      const m = JSON.parse(measured.result.value);

      const slug =
        (route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-')) +
        `-${width}` +
        (flag('full') ? '-full' : '') +
        (flag('bottom') ? '-bottom' : '') +
        (flag('reduced') ? '-reduced' : '') +
        (flag('no-js') ? '-nojs' : '');

      /*
        `--full` captures past the viewport, which is the only way to look at a
        long page in one picture. Two things have to be dealt with first, or the
        picture lies about the page:

        Lazy images below the fold were never near the viewport, so they have no
        pixels — a gallery would photograph as three images and a large hole.
        Promoting them to eager and waiting on `decode()` fills them in.

        And with motion on, everything below the fold is still at its
        pre-animation state, because the reveals fire on scroll. So pair this
        with `--reduced` or `--no-js`, where nothing is hidden in the first
        place.
      */
      if (flag('full')) {
        await page.send('Runtime.evaluate', {
          expression: `Promise.all([...document.images].map((img) => {
            img.loading = 'eager';
            return img.decode().catch(() => {});
          }))`,
          awaitPromise: true,
        });
        await sleep(1200);
      }

      const shot = await page.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: flag('full'),
      });
      fs.writeFileSync(path.join(OUT, `${slug}.png`), Buffer.from(shot.data, 'base64'));

      // Nothing may be hidden when the thing that unhides it can't run.
      const mustBeVisible = flag('no-js') || flag('reduced');
      const bad =
        m.hOverflow > 0 ||
        m.headerFits === false ||
        m.imagesNoAlt > 0 ||
        (mustBeVisible && m.hiddenReveals > 0);
      if (bad) failures++;

      console.log(
        (bad ? 'FAIL ' : '  ok ') + slug.padEnd(26),
        `overflow=${m.hOverflow}`.padEnd(13),
        `header=${m.headerH}`.padEnd(11),
        `fits=${m.headerFits}`.padEnd(11),
        `stickyTop=${m.stickyTop}`.padEnd(14),
        `taps=${m.taps.join('/')}`.padEnd(10),
        mustBeVisible ? `hidden=${m.hiddenReveals}` : '',
        m.imagesNoAlt ? `IMAGES WITHOUT ALT=${m.imagesNoAlt}` : '',
        m.wide.length ? `past the edge: ${m.wide.join(' ')}` : ''
      );
    }
  }
} finally {
  proc.kill();
}

console.log(
  failures
    ? `\n${failures} shot(s) failed — see FAIL above. PNGs in .shots/`
    : `\nall clear. PNGs in .shots/`
);
process.exit(failures ? 1 : 0);
