# CLAUDE.md

Portfolio website for **Lea Kassem**, Senior Interior Architect (Beirut, Lebanon).
Static site, built by a friend as a favour. Read `work.md` first — it holds the
roadmap, current step, and open decisions.

## Driving this project

When the user says **"next step"**, "continue", "do the next step", or similar:

1. Read `work.md`.
2. Find the first step marked `todo` and mark it `doing`.
3. Read anything its Task section references (`docs/BRIEF.md` sections, etc.).
4. Check the step's blocking open items. If one is genuinely blocking, say so and
   ask — otherwise proceed and note the assumption.
5. Do the work, verify it against the step's "Done when", then follow the session
   protocol at the bottom of this file.

Other phrasings: *"do step N"* runs a specific step out of order. *"where are we"*
summarises `work.md` without doing work. The user should never need to paste a
prompt — `work.md` is the instruction source.

## Stack

- **Astro 5** — static output, content collections for projects
- **Tailwind CSS 4** — via `@tailwindcss/vite`, config lives in `src/styles/global.css`
- **GSAP + ScrollTrigger + SplitText** — scroll-driven animation
- **Lenis** — smooth scroll
- **Inter Variable** — self-hosted from `src/assets/fonts/`, no CDN
- **GitHub Pages**, deployed by `.github/workflows/deploy.yml` on every push to
  `main`. Repo is `leakassem/leakassem.github.io` — a user site, which is why
  `base` stays `/` and the repo name has to be exact.

## Commands

```bash
npm install        # once
npm run dev        # http://localhost:4321 — hot reload
npm run build      # static output to dist/
npm run preview    # serve dist/ exactly as it will appear live
```

There is no test suite. `npm run build` passing is the check — it type-checks
content collections and catches broken image references.

**There is a browser on this machine** (Chrome and Edge), so a layout claim can
be verified rather than assumed. With `npm run preview` running in another
terminal:

```bash
node scripts/shoot.mjs                 # every main route at 375 / 768 / 1440
node scripts/shoot.mjs --all           # every route in dist/, project pages included
node scripts/shoot.mjs /work --bottom  # one route, scrolled to the footer
node scripts/shoot.mjs --no-js         # JavaScript disabled
node scripts/shoot.mjs --reduced       # prefers-reduced-motion: reduce
node scripts/shoot.mjs /work --full    # the whole page, not just one screen
```

PNGs land in `.shots/` (gitignored) and every shot prints its measurements. It
exits non-zero on horizontal overflow, a header row that doesn't fit, an image
that has a source but no `alt`, or — under `--no-js` / `--reduced` — any reveal
target still at `opacity: 0`. Prefer this over `chrome --headless
--window-size`, which Windows silently clamps to about 500px wide, so a "375px"
shot is a lie.

**Pair `--full` with `--reduced` or `--no-js`.** A full-page capture forces every
lazy image to load first, but it can't make below-the-fold reveals fire — those
wait on scroll — so with motion on, a full shot photographs half the page at
`opacity: 0` and implies a bug that isn't there.

`--all` is the one that covers the 17 project pages; the default four routes
don't. `/styleguide` and `/404.html` are only in `--all` too, which is why an
overflow that had been in it since step 2 wasn't found until step 7.

Two generators produce the images that aren't part of a page, and both commit
their output because a crawler or an OS fetches it by a fixed name:

```bash
node scripts/make-og.mjs      # public/og/card.jpg — the social card, 1200×630
node scripts/make-icons.mjs   # public/apple-touch-icon.png from favicon.svg
```

Re-run `make-og.mjs` if the identity or the lead photograph changes, and
`make-icons.mjs` if the favicon does. `make-og.mjs` renders the card in Chrome
so it is set in the real typeface with the real tokens; finding a browser and
opening a page is `scripts/lib/chrome.mjs`, which `shoot.mjs` shares.

Lighthouse is not a dependency — run it through npx against the preview server:

```bash
npx -y lighthouse http://localhost:4321/ --quiet \
  --chrome-flags="--headless=new --disable-gpu" \
  --output=json --output-path=.shots/lh/home.json \
  --only-categories=performance,accessibility,best-practices,seo
```

**In Git Bash, prefix a route argument with `MSYS_NO_PATHCONV=1`** — otherwise
`/work` is rewritten to `C:/Program Files/Git/work` before Node sees it, the
route no longer starts with `/`, and the script quietly falls back to shooting
every default route instead of the one asked for. PowerShell needs no prefix.

## Deploying

`git push` to `main` is the deploy — the workflow runs `npm run build` (so
`astro check` gates it) and publishes `dist/` to Pages. Watch a run in the repo's
Actions tab; a red build means nothing is published, and the previous version
stays live.

`gh` is **not** installed on this machine, so anything needing the GitHub API is
a browser step for the user. Don't propose installing it.

**`public/robots.txt` allows everything except `/styleguide/`** since step 9,
and points at `/sitemap.xml`. It was a disallow-all placeholder while the site
was being built; that is gone. If a page should stay out of search, give it
`noindex` in `BaseLayout` rather than adding a `Disallow` — a disallowed page
can still be indexed from an inbound link, and `BaseLayout` also drops its
`canonical` and `og:url` when `noindex` is set.

**`[glob-loader] Duplicate id "…"` is a stale cache, not a duplicate file.**
Astro's content store persists in `.astro/`, and editing a project markdown file
re-adds an id the store already holds. `rm -rf .astro` clears it. The warning is
harmless — the reloaded entry is the one that wins — but it's noisy enough to
mistake for a real problem.

## Hard rules

1. **Never commit `*.pdf` or `*.docx`.** The source portfolio and CV contain Lea's
   personal phone number and address. They are gitignored. Do not remove those
   rules, do not `git add -f` them, do not copy their contents into tracked files.
2. **Never put a phone number, home address, or social handle in any file.**
   Contact is email only — that is a deliberate decision by the site owner.
   The email must be assembled by JS at runtime, never sitting as plain text in
   the HTML, with a non-JS fallback.
3. **Do not open the source PDF.** Its text is already in `docs/BRIEF.md` and its
   pages are already extracted to `src/assets/sheets/`. Reopening it costs ~50k
   tokens for information you already have.
4. **Never add the PDF cover or back cover to the repo.** Both have Lea's phone
   number baked into the image, and pixels can't be gitignored. They are
   deliberately excluded from `src/assets/sheets/`.
5. **Respect `prefers-reduced-motion`** in every animation, without exception.

## Design system

Built in step 2 and rendered in full at **`/styleguide`** — open that before
adding anything visual, and update it when the system changes.

- **Tokens live in `src/styles/global.css`.** Colour, type scale, spacing,
  measures and easings are all there. A page needing a value that isn't a token
  should get a new token, not a hard-coded number.
- **`--color-muted` is at the contrast floor.** It has to clear 4.5:1 against
  the *ground* (`#e8e8e8`), not just against paper, because every vertical
  label, the nav and the footer are muted text on the grey. `#666666` is
  4.69:1 there; anything lighter than about `#686868` fails. So muted text can
  never be dimmed further with `opacity` on the ground — that is what took the
  filter chips' counts to 2.29:1 until step 9.
- **Layout primitives** in `src/components/`: `Section` (vertical rhythm, ground
  tone, and the signature left rule via its `label` prop), `Container`
  (horizontal bound and gutters), `Grid` (columns), `Media` (every picture),
  `VerticalRule` (the rule and vertical label on their own). Section owns
  vertical space, Container owns horizontal — that split is what lets a band run
  full-bleed while its text stays measured.
- **Shared pieces built on those primitives**: `ProjectCard` (how a project
  introduces itself — home and `/work` both render it, so change it once),
  `EmailLink` (the contact address, below), the filter chips (`.filter-input` +
  `.chip`), and the component classes `.link-rule` (the site's only button-like
  link) and `.project-card`. All are on `/styleguide` under **Components**.
- **`EmailLink` is the only way the email reaches a page.** It ships the
  address reversed and base64-encoded in a data attribute and assembles the
  `mailto:` in the browser, so no built page carries an address a regex can
  find. Until the script runs the anchor has **no `href`**, which is why every
  link affordance in `.email-link` is scoped to `[href]`: with JS off the
  `<noscript>` fallback shows `lea_kassem [at] hotmail [dot] com`, and text
  that can't be clicked must not look clickable. Don't give it a placeholder
  `href` and don't move the address into markup.
- **`/work` filters in CSS, not JavaScript.** Each facet is a radio group, and
  `src/pages/work/index.astro` generates one rule per option — plus the
  selectors for the combinations that match nothing — from the project data
  itself. So the filters work with JS off, they combine, `type="reset"` clears
  them, and no rule can disagree with the content. The script on that page is
  enhancement only: it mirrors the selection into the query string and
  announces the count. Don't replace this with client-side rendering.
- **`/work/[slug]` is one template for all 17 projects.** Metadata rows and the
  role list are `.rule-list`; the role list is one block per source sheet
  (`scopesOf`), so a project covering only a reception and a media room says so
  rather than flattening into one list. The gallery's lightbox is enhancement:
  every tile is a link to the image file, and the script intercepts the click to
  show that same file in a native `<dialog>`. **Keep it a link, never a button**
  — the link is what a reader with JS off gets, and `showModal()` is where the
  focus trap and the Escape key come from rather than from code of ours.
- **View transitions are on, site-wide** (`ClientRouter` in `BaseLayout`). Three
  consequences worth knowing before touching anything client-side:
  - **A page script must re-run on `astro:after-swap`.** The browser will not
    re-execute a module script it has already run, so a page-level script that
    only runs at module scope works once and then silently stops. `/work` and
    `/work/[slug]` both wrap their setup in a function and call it again there.
  - **Never write `history.replaceState(null, …)`.** The router keeps its
    bookkeeping in `history.state`, and a popstate carrying no state is one it
    won't handle — which breaks the back button, changing the URL and nothing
    else. Pass `history.state` through.
  - **The swap copies root attributes off the incoming document**, taking the
    `.motion` class with them. `armMotionGate()` puts it back on that document
    before it lands; without it every navigation after the first arrives with
    nothing hidden and so nothing to animate.
- **Motion is opt-in by data attribute**, never a hand-written tween in a page:

  | Attribute | Effect |
  |---|---|
  | `data-reveal` | Fade and rise — the default for a block of content |
  | `data-reveal="heading"` | Line-by-line mask reveal |
  | `data-reveal="image"` | Scale 1.06 → 1, inside a `.media` clip box — `Media` sets this for you |
  | `data-reveal="grid"` | Stagger direct children (`Grid`'s `stagger` prop) |
  | `data-parallax="10"` | Scroll-linked drift — hero imagery only, never text |

  A grid stagger owns its children's entrance, so don't also mark them
  `data-reveal="image"`.
- **Pre-animation states are CSS**, gated on a `.motion` class that an inline
  script in `BaseLayout` adds. With JS off, nothing is ever hidden; if the
  motion bundle fails, a timer strips the class. Never hide a reveal target
  outside that gate.
- **`BaseLayout` owns every page's metadata too** — canonical, Open Graph,
  Twitter card, theme colour, the icons and the font preload. A page passes
  `title`, `description`, optionally `noindex`, and optionally an `image`; it
  never writes a `<meta>` of its own. The card it shows comes from
  `src/lib/social.ts`: `SITE_CARD` is the composed card in `public/og/`, and
  `socialImageFor(project)` crops that project's hero to 1200×630 at build
  time, so a shared project link previews the project. `/sitemap.xml` is a
  route (`src/pages/sitemap.xml.ts`) built from `NAV` and `hrefOf()`, so it
  cannot list a URL the site doesn't link to or miss one it does.
- **`BaseLayout` owns the page landmarks** — `SiteHeader`, `<main id="main">`
  and `SiteFooter`, plus the skip link. A page supplies the *content* of main,
  never the element, so no page can ship without its landmarks or without a
  skip target. `src/lib/nav.ts` is the one route list both header and footer
  read, and `currentFor()` decides each link's `aria-current`. The nav has no
  toggle and no JavaScript: three routes fit on one line at 375px, and if a
  fourth ever doesn't, the fix is a CSS-only disclosure, not a scripted one.

## Conventions

- Project content lives in `src/content/projects/*.md` — one file per project,
  named for its slug, never hand-written HTML per project. The schema is
  `src/content.config.ts`; the filter vocabularies (type, status, country,
  city, studio) are `src/lib/facets.ts`; every derived value — country, area,
  role list, facet counts, a project's href and its view-transition name —
  comes from a helper in `src/lib/projects.ts`. **Pages read through those
  helpers**, never straight from `entry.data.sections`, so how a project's area
  is assembled stays one decision in one place.
- **Nothing in a project file is editorial.** Every field traces to
  `docs/BRIEF.md` §4. Where the brief states no fact, the field is absent —
  don't invent completion years, client names or descriptions.
- **Her CV is `src/lib/cv.ts`** — experience, education, skills, software,
  languages and the six project stages, all from `docs/BRIEF.md` §1. `/about`
  renders it, and `STUDIO_PERIODS` in `facets.ts` derives the years a project
  page prints beside a studio name from those same entries via `yearsAt()`. So
  correcting a date is one edit, and the timeline can't disagree with a project
  page. `cv.ts` must stay import-free: `facets.ts` reads it, and that is
  reached from `content.config.ts`.
- **The email address is `src/lib/contact.ts`**, which deliberately does not
  export the raw string — only the encoded and spelled-out forms. Changing the
  address is one edit there; see `EmailLink` above.
- **Anything derivable is derived, not stored** — country from city, a
  project's area and role list from its sections. Adding a field that can
  contradict another is the thing this model exists to prevent.
- **Images are temporary.** Current images are cropped from the PDF sheets in
  `src/assets/sheets/` and will be replaced with Lea's originals later. Reference
  them by project slug and role (`hero`, `gallery`), never by sheet number or
  crop coordinates, so the swap is a file drop rather than a refactor.
- **Pages render pictures through `Media`**, never a hand-written `<Image>` /
  `<Picture>`, and never a bare `<img>` with a `/public` path. GitHub Pages
  cannot resize images, so every responsive variant is generated at build time —
  `Media` is the one place deciding which. It always needs `sizes`; without it
  the browser assumes 100vw and pulls the largest variant for a thumbnail.
- Internal links: root-relative **with a trailing slash** (`/work/az-triplex/`).
  That is the URL GitHub Pages serves; the slashless form only 301s to it, so
  writing it costs every visitor a redirect. `trailingSlash: 'always'` in
  `astro.config.mjs` makes `astro dev` 404 a slashless link rather than serving
  it, which is how the next one gets caught (`astro preview` is lenient, so a
  local preview won't tell you). Nav hrefs come from `src/lib/nav.ts` and
  project hrefs from `hrefOf()`, so most of this is two files.
- Every image needs meaningful `alt` text describing the space, not the filename.
- Prefer editing an existing component over adding a near-duplicate one.

## Adding or replacing a project image

Images live in `src/assets/projects/<slug>/` as `hero.jpg` and `gallery-NN.jpg`,
and are listed in that project's markdown frontmatter with their alt text. The
filename carries slug and role only — never a sheet number or a crop box — which
is what makes the three cases below a file drop rather than a refactor.

**Replacing one image with a better version of the same shot.** Overwrite the
file. Nothing else changes: `Media` re-derives the variant ladder from the new
file's width, so a bigger original automatically gets bigger variants. Re-check
the alt text still describes what is in the frame.

**Adding an image to a project.** Drop the file in as the next `gallery-NN.jpg`
and add a `{ src, alt }` entry to that project's `gallery:` array, in the order
it should appear. `src` is a path relative to the markdown file
(`../../assets/projects/<slug>/gallery-06.jpg`); a path that doesn't resolve
fails the build rather than shipping a hole.

**Replacing a whole project's images with Lea's originals** (open item 1 in
`work.md`). Drop them into `src/assets/projects/<slug>/` under the same names,
then rewrite that project's alt text. No layout, component or page changes.

**Re-cutting from the sheets** — only while the PDF crops are still the source.
`node scripts/crop-sheets.mjs` rewrites every crop and the manifest;
`--dry-run` reports what it would do without writing. Its two hand-maintained
lists are `DROP` (detections that shouldn't reach the gallery) and `HERO` (which
photo leads each project), both keyed by box overlap rather than index so a
change to the detector can't silently drop the wrong thing. Re-running renumbers
`gallery-NN`, so check the frontmatter alt text still lines up afterwards.

## Copy notes

- Her title is **Interior Architect** (per CV). The old PDF cover says "Interior
  Designer" — do not use that.
- The source PDF has typos (`apartement`, `electical`, `supervison`). Corrected
  spellings are already in `docs/BRIEF.md`; use those.
- Tone: restrained and factual, matching her existing layouts. No marketing
  adjectives, no "passionate about design".

## Session protocol

**Every session must end by updating `work.md` and pushing:**

1. Mark the step's status (`todo` → `doing` → `done`).
2. Fill in that step's **Outcome** line — what actually exists now.
3. Add anything discovered to **Open items** if it needs a human decision.
4. If a decision was made, append it to the **Decisions log** with the date.
5. `npm run build` must pass, then commit and `git push origin main`. **Don't ask
   first** — since step 10 the push is the deploy, and a step that isn't pushed
   isn't finished. The user can say "local only" for a step they want held back.

**Before every commit, check what is staged** — not just that `.gitignore` looks
right. `git status --porcelain -uall` and confirm no `.pdf`, `.docx` or `.doc` is
among the files. This repo is public and Lea's phone number and address are in
those documents; git history keeps them forever.

Then confirm the deploy rather than assuming it: the Actions run has to be green,
and a fetch of the live URL should show the change. **A red run publishes
nothing and leaves the previous version live** — safe, but silent.

If something in this file becomes wrong (a command changes, a convention
shifts), fix it in the same session rather than leaving it stale.
