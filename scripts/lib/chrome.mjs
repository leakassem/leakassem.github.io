/*
  Driving the installed Chrome (or Edge) over the DevTools Protocol.

  Extracted from `scripts/shoot.mjs` in step 9, when `scripts/make-og.mjs`
  needed the same three things: find a browser, open a page, talk to it. No
  Puppeteer and no Playwright — the browser is already on the machine and CDP
  is a WebSocket, which Node has built in.

  Why the browser at all, for an image: the social card has to be set in the
  site's own typeface with the site's own tokens. Chrome already knows how to
  render that; sharp would need the font installed system-wide and would still
  lay the text out differently from the page it is quoting.
*/
import { spawn } from 'node:child_process';
import fs from 'node:fs';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

export function findChrome() {
  const chrome = CHROMES.find((p) => fs.existsSync(p));
  if (!chrome) throw new Error(`no Chrome or Edge found. Tried:\n  ${CHROMES.join('\n  ')}`);
  return chrome;
}

export class CDP {
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

export async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });
  return new CDP(ws);
}

/**
 * Launch a headless browser and return a CDP session on one blank page.
 *
 * `allowFile` lets the page read `file://` URLs, which the OG card needs and
 * a screenshot of the preview server does not.
 */
export async function openPage({ port, profile, allowFile = false }) {
  const proc = spawn(
    findChrome(),
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      ...(allowFile ? ['--allow-file-access-from-files'] : []),
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let version;
  for (let i = 0; i < 60 && !version; i++) {
    try {
      version = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());
    } catch {
      await sleep(250);
    }
  }
  if (!version) {
    proc.kill();
    throw new Error('the browser never opened a debugging port');
  }

  const browser = await connect(version.webSocketDebuggerUrl);
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
  const page = await connect(list.find((t) => t.id === targetId).webSocketDebuggerUrl);

  /*
    `Browser.close` rather than killing the process. Chrome's renderers, GPU
    process and crashpad handler are separate processes that a SIGKILL to the
    parent leaves running on Windows — eleven of them were still holding the
    profile directory open when this was found. Asking the browser to close
    shuts the whole tree down; the kill is the fallback if it doesn't answer.
  */
  const close = async () => {
    try {
      await Promise.race([browser.send('Browser.close'), sleep(3000)]);
    } catch {
      /* already gone */
    }
    proc.kill();
  };

  return { page, close };
}
