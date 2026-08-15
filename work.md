# Work Plan — Lea Kassem Portfolio

## How to use this file

Start a new Claude session in this folder and say **"next step"** (or "continue"
/ "do the next step"). Claude reads this file, finds the first step marked
`todo`, and does it. No copying, no pasting.

To do something out of order, name it: *"do step 6"*.
To see where things stand: *"where are we"*.

Every session updates this file before finishing, so it is always the current
state of the project.

> **Current step: 8 — About & contact** (`todo`). Every project now has its own
> page and the site navigates as one piece: cards link to `/work/<slug>`, and
> view transitions carry the hero image from the card into the page it opens.
> Step 10 was pulled forward and is done: the site is at
> **https://leakassem.github.io** and every push to `main` redeploys it. A step
> isn't finished until it's pushed.
>
> **Read the view-transitions notes in `CLAUDE.md` before writing any
> client-side script.** Since step 7 the whole site swaps documents rather than
> reloading, which changes three things about page scripts, `history` and the
> motion gate. Step 7 hit all three; two of them were silent.
>
> Step 8's blocking open items are **2** (which email to publish) and **4**
> (residential-only vs the CV's claim of commercial work). Both need Lea.

---

## Decisions log

| Date | Decision | Notes |
|---|---|---|
| 2026-08-14 | Astro 5 + Tailwind 4 + GSAP + Lenis | Data-driven so one template renders all 17 projects; build-time image optimisation, which GitHub Pages can't do itself |
| 2026-08-14 | English only | French adds copy work Lea would have to write, not just routing |
| 2026-08-14 | Contact: email only | No phone, no address, no social links. Email assembled by JS so it isn't scrapeable |
| 2026-08-14 | Build locally first, GitHub later | No remote until step 10 |
| 2026-08-14 | Repo on **Lea's own account** — `github.com/leakassem`, repo `leakassem.github.io`, site `https://leakassem.github.io` | Never needs transferring, base path never changes, her name in the URL from day one |
| 2026-08-14 | Base path stays `/` | Correct for a user site and for a custom domain |
| 2026-08-14 | `overrides: { vite: "^6.4.1" }` | Astro 5 uses Vite 6; npm otherwise installs Vite 8 for `@tailwindcss/vite`, and two copies break `astro check`. Remove when Astro moves to Vite 8 |
| 2026-08-14 | **Build with PDF-extracted images now**, swap for originals later | Unblocks steps 4–7 immediately. Requires designing so images can be replaced without touching layout |
| 2026-08-14 | **Inter Variable** as the grotesque, vendored into `src/assets/fonts/` | Closest open-licence match to the Helvetica-like face in her sheets. One 48 KB latin file covers weights 300–700. Vendored rather than kept as an npm dependency that exists to hand us one file — the licence travels with it. Open item 8 covers buying a licensed face instead |
| 2026-08-14 | Motion is **opt-in by data attribute**, never a tween written in a page | Keeps the motion language in one file. A page that needs a new effect adds a primitive to `motion.ts` rather than one-off GSAP, so reduced-motion handling can't be forgotten at a call site |
| 2026-08-14 | **Site chrome gets its own step (4b)**, before the home page | No step owned the global header and footer — 5–8 each build a page that assumes they exist, and step 9 audits keyboard nav on a nav nothing had built. Inserted as `4b` so the existing step numbers, which the open items table and `CLAUDE.md` both reference, stay valid |
| 2026-08-14 | Pre-animation states are CSS gated on a JS-added `.motion` class, with a 2s failsafe timer | Avoids a flash of un-animated content without the usual cost — JS off hides nothing, and a motion bundle that fails to load can't leave the page blank |
| 2026-08-14 | A project is **a list of sections, one per source sheet** — each with its own rooms, area, status and role bullets | Projects aren't uniform. AD villa is two sheets covering different rooms with different areas and different roles; Faqra is one sheet covering the whole chalet. Flattening to the project would lose "70 m² reception", and it gives step 7 its sub-headings for free |
| 2026-08-14 | **Country is derived from city**, never stored on a project | One fact in one place — a project can't claim Dubai, Lebanon. Same rule gives project area from its sections and the role list from their union. The model's job is to make contradictions unrepresentable |
| 2026-08-14 | **Portfolio order = source sheet order** | It's Lea's own sequence and it groups the studios, so no hand-maintained `order` field can fall out of step with the content. If she wants a different order later, it becomes one optional `order` field consulted first in `getProjects()` |
| 2026-08-14 | `/work`'s location facet is **country**, not city | `docs/BRIEF.md` §5 calls country the more useful top-level cut, and it's the only location facet whose options stay countable at 17 projects — UAE 5 · Qatar 1 · Lebanon 11. City and district stay as display detail |
| 2026-08-14 | Qatar villa's project-level status is **under construction** | Its interior is complete and its outdoor isn't; the brief states no project-level status. "Under construction" is the honest answer to a filter. The per-section statuses hold the detail |
| 2026-08-14 | Project markdown **bodies are empty** | A project page is metadata, role and images. Written copy would have to come from Lea, and inventing it breaks the tone rules in `CLAUDE.md`. The body is there when she supplies it — open item 9 |
| 2026-08-14 | Photos are found by **recursive XY-cut**, not hand-measured crop boxes | 23 sheets × 4–7 photos is 100+ rectangles to measure by hand and re-measure whenever anything changes. The sheets separate their photos with white gutters, which is exactly what an XY-cut reads. Two false positives across the whole set, both configured out by name |
| 2026-08-14 | Crop script is **Node + sharp**, not Python | Detection was prototyped in Python/numpy, but sharp already ships with Astro. Node means re-running the pipeline needs no toolchain beyond `npm install` |
| 2026-08-14 | **Hero photo per project is an explicit editorial pick**, not the largest crop | Picking by area alone hands VBM villa a flat wardrobe elevation over its living room. 17 choices is small enough to make deliberately; they live in `HERO` in `scripts/crop-sheets.mjs` and Lea should confirm them — open item 11 |
| 2026-08-15 | `DROP` covers **three things**: drawings, reprints, and one watermarked twin | It was documented as "not photographs", which didn't cover a text-column reprint or a near-identical repeat. Widening the stated purpose beats adding a second list that does the same job |
| 2026-08-15 | Sheet 6's **watermarked door render is dropped**, not retouched | It prints twice: once tighter with "THE DIFC PROJECT" burned in, once wider and clean. The clean one shows strictly more, so the branded crop had no reason to survive. Closes the "watch for" note that step 4 was carrying |
| 2026-08-15 | **A `Media` component owns every picture**, no page writes its own `<Picture>` | Formats, the width ladder, the aspect box and the reveal wiring are one decision each. A page that hand-rolls an `<Image>` is how a 1500px JPEG ends up on a phone, and GitHub Pages can't resize at request time to save it |
| 2026-08-15 | The **variant ladder stops at the source width** | Upscaling a soft PDF crop only makes a bigger soft crop. Deriving the ladder from `src.width` also means Lea's originals get bigger variants automatically when they land — no code change, which is the whole point of the file-drop convention |
| 2026-08-15 | Styleguide demos use **real project crops**, not the sheet composites | It's the design system reference; it should show what the site actually ships. The composites were a step 2 placeholder from before crops existed |
| 2026-08-15 | **There is a browser on this machine** — Chrome and Edge both. Steps 2 and 4 closed saying there wasn't | The claim was never checked, and it cost two steps their visual verification. `scripts/shoot.mjs` drives Chrome over the DevTools Protocol — no Puppeteer, no new dependency, since CDP is a WebSocket and Node has one built in. It fails the run on horizontal overflow, a header row that doesn't fit, a missing `alt`, or a reveal target left invisible under `--no-js` / `--reduced` |
| 2026-08-15 | Viewport is set with **CDP `setDeviceMetricsOverride`**, never `--window-size` | Windows clamps a headless window to roughly 500px wide, so `--window-size=375,812` silently renders at ~500px. The first 375px screenshot of the header looked broken for exactly this reason and the header was fine |
| 2026-08-15 | **`BaseLayout` owns header, `main` and footer**; pages supply main's content, not the element | One owner means no page can ship without its landmarks, and `#main` is always there for the skip link. Cost: three existing pages lost their own `<main>` wrapper |
| 2026-08-15 | **No mobile menu.** The nav is three links that stay visible at 375px | Measured, not guessed: 274px of content in 335px of room at 375px. No overlay means no focus trap, no Escape handler, no toggle state and no JavaScript — the nav behaves identically whether the motion bundle loads or not. A fourth route that doesn't fit becomes a CSS-only disclosure, never a scripted one |
| 2026-08-15 | The header **sticks**; it does not hide on scroll or scroll away | `/work` is a long grid and project pages are longer, so the nav has to stay reachable. It is also the only one of the three options with nothing to animate, so there is nothing to no-op under reduced motion |
| 2026-08-15 | Current-page styling is selected on **`aria-current`**, not a class of its own | What a screen reader announces and what a sighted reader sees become the same fact and can't drift. `page` for the exact route, `true` for an ancestor — which is what `/work/<slug>` needs so Work stays lit |
| 2026-08-15 | `/about` and `/contact` get **noindex stubs now**, real pages in step 8 | The header links to them from this step on, and a nav link that 404s is worse than a thin page. Noindex keeps the placeholders out of search |
| 2026-08-15 | **Step 10 moves ahead of step 5** — deploy first, then build the pages | Reverses "build locally first, GitHub later" (2026-08-14). A live URL means the remaining pages get watched on a real phone over a real network, and every push is version-controlled from now on rather than one commit at the end. The cost is that an unfinished site sits at Lea's permanent URL, which the robots decision below covers |
| 2026-08-15 | `robots.txt` is **disallow-all until step 9** | The home page is a placeholder and `/work` is a scaffold; the pages that already exist carry noindex individually, but the home page doesn't. A crawl now is what a search for her name would surface for months. Risk is the mirror image — forgetting to lift it — so it's written into open item 13, step 9's task, and a comment in the file itself |
| 2026-08-15 | The deploy workflow is **written out, not `withastro/action`** | CI then runs the exact `npm run build` the dev machine runs, `astro check` included, so a type error or a broken image path fails the deploy instead of shipping. One less third-party action in a repo that will be pushed to rarely and reviewed even more rarely |
| 2026-08-15 | `.gitattributes` normalises text to **LF** | Windows dev machine, Linux CI. Without it the first checkout on another machine can show every file as modified, which buries a real diff |
| 2026-08-15 | The footer's vertical label is **the location**, not "Contact" | It's what her sheets set alongside the rule in their own footers (`docs/BRIEF.md` §2), and "Contact" repeated the page's own label back at it on `/contact` |
| 2026-08-15 | **The featured six are re-picked on the strength of the image**, not floor area | Open item 10 flagged the original set as "picked on floor area, which is not the same as strongest", and this step had to ship a home page either way. Seeing all 17 heroes side by side settled it: out go VBM villa, 3BF apartment and Vacation house; in come AD villa, K1 villa and B11 apartment. The set also spreads better — 3 studios apiece, UAE 3 · Lebanon 2 · Qatar 1. Still Lea's call to confirm |
| 2026-08-15 | The home page's lead photograph is **3B apartment's**, and 3B apartment is deliberately *not* featured | At 1314px it is the largest and sharpest crop on the site, so it earns the first screen. Showing the same photograph again in a card one screen later is repetition rather than emphasis, so the project leads instead of appearing twice. No caption — her cover sheet's photograph carries none either |
| 2026-08-15 | The hero photograph is **a band across the foot of the card**, not a column beside the name | A column next to the text is portrait-shaped, and filling one made `cover` scale a 2:1 crop up by about 2× — the soft hero `docs/BRIEF.md` §6 says to design around rather than into. Across the card it renders at 1313px from a 1314px source: no upscaling at all, and the crop happens where the image has pixels to spare |
| 2026-08-15 | `--text-display` retuned from **10vw to 7vw** | Display type is sized for the column it is set in, not for the page width. At 10vw the name's longest word alone was wider than the hero's text column, and min-content is a whole word — it does not wrap away. 7vw leaves real margin at every width, and the name is still 100px at 1440 |
| 2026-08-15 | `.first-screen` is an **exact height from 64rem up**, a minimum below it | A `1fr` grid row can only take "whatever the text leaves" if the height it divides is definite; against a min-height it falls back to its content's own height, which pushed the hero 371px past the viewport. On a phone the minimum is still the right rule — a first screen should grow with its content rather than crop it |
| 2026-08-15 | **`/work` filters in CSS, not JavaScript** — a radio group per facet and a generated rule per option | It makes the JS-off baseline the *only* implementation rather than a second one kept in step with the first, which is where filtering usually rots. The groups combine for free, `type="reset"` clears them for free, and there is no toggle state to get wrong. The script left over is genuinely optional: query-string sync and a spoken count |
| 2026-08-15 | The filter rules and the empty-state selectors are **generated from the project data**, not written out | 11 hide rules and 16 empty-combination selectors is more than anyone will keep correct by hand, and half the combinations really are empty — no villas in Lebanon, no apartments in Qatar. Generated, they cannot disagree with the content. Enumerating empty pairs before triples takes 41 selectors down to 16 |
| 2026-08-15 | Studio is **not** a filter on `/work`, though `docs/BRIEF.md` §5 lists it | Three groups already fill a phone screen. A fourth for two values that mostly restate the date range is more UI than it earns; `facetsOf()` still computes it, so adding it back is a one-line change |
| 2026-08-15 | Project cards link to **`/work`** until step 7 exists | `hrefOf()` in `src/lib/projects.ts` is the only place that decides, so step 7 changes one line. The site is live, and a card that 404s is worse than one that lands on the index |
| 2026-08-15 | A project's role is **one block per source sheet**, not a flattened union | The content model has said so since step 3; step 7 is where it shows. AD villa reads as "Reception area, 70 m²" and "Media room, guest bedroom & home office, 50 m²" with their own bullets, which is what she actually did. A union would print eleven bullets and lose which job each belonged to. `scopesOf()` replaces step 3's `roomsOf` and `rolesOf` — two helpers assembling the same material separately is the contradiction this module exists to stop |
| 2026-08-15 | Gallery tiles are **4:3**, and the lightbox shows the image whole | Picked off the actual crops rather than by eye: the middle half of the 113 gallery images falls between 1.28 and 1.54, median 1.42. 21 are portrait and are cropped in the grid — which is the trade a tight aligned grid costs, and the reason the lightbox contains rather than covers |
| 2026-08-15 | The lightbox is a **native `<dialog>`**, and every tile is **a link to the image file** | `showModal()` supplies the top layer, the focus trap and Escape, so none of that is reimplemented — the script only chooses which image is showing and returns focus. And because the tile is a link rather than a button, the JS-off baseline isn't a dead control: it opens the photograph at full size. Verified both ways |
| 2026-08-15 | **View transitions on site-wide**, with a per-project transition name | `docs/BRIEF.md` §2 asks for it and the hero is the thing worth carrying: the card's image and the detail page's are the same file at the same 2:1 crop, so they morph rather than cross-fade. `transitionNameOf()` derives the name at both ends — prefixed, because a CSS identifier can't start with a digit and `3b-apartment` does. Cost is three new rules about client-side code, all now in `CLAUDE.md` |
| 2026-08-15 | The detail hero gets **no entrance reveal** | It is above the fold, so there is no entrance to play — and a reveal would hold it at `opacity: 0` at exactly the moment the view transition snapshots it, turning the morph into a fade from nothing. Same reasoning as the home page's lead photograph |
| 2026-08-15 | Reduced motion must disable **`::view-transition-*` explicitly** | The global guard is `*, *::before, *::after`, and a view transition's pseudo-elements are descendants of nothing, so `*` never reaches them. Without the extra rule both the page cross-fade and the hero's move would still run under `prefers-reduced-motion` — the one exception hard rule 5 doesn't allow |
| 2026-08-15 | `src/pages/work.astro` moved to `src/pages/work/index.astro` | `/work` and `/work/[slug]` are one section and now read as one directory. Astro serves both either way; this is tidiness, and the only cost was import depth |
| 2026-08-15 | The **studio is surfaced on the detail page**, with its years | It is the one fact `facetsOf()` computes that nothing rendered — step 6 deliberately left it out of the filters as a fourth chip group that wasn't worth the phone screen. A metadata row is where it belongs: useful context, no UI |

---

## Open items

| # | Item | Blocks | Status |
|---|---|---|---|
| 1 | **Better images, eventually.** Building with PDF crops for now (see step 4). Ask Lea for her original renders and site photos when convenient — they'd be 2000–4000 px vs the ~600–900 px we can crop. Swap-in should be cheap if step 4 is done right. | nothing — deferred | open |
| 2 | **Which email to publish.** Only `lea_kassem@hotmail.com` is on record; reads dated for a senior portfolio. Suggest a cleaner address. | Step 8 | open |
| 3 | **Yafawi Design work.** Portfolio has nothing from her current role (Sep 2025–present, Europe). As-is the site implies she stopped working in Aug 2025. NDA? | Step 5, 6 | open |
| 4 | **Residential only.** CV claims residential *and* commercial; every sheet is tabbed Residential. Get commercial work or drop the claim. | Step 8 | open |
| 5 | ~~Where the repo lives.~~ Resolved 2026-08-14: Lea's own account. | — | done |
| 6 | **3D designer credits.** Several sheets say "collaborated with the 3D designer". Check whether anyone needs crediting. Since step 7 this line is **printed on the project pages** — it's a role bullet, rendered verbatim as the sheet states it, on 3B, Qatar villa and the others that carry it. So the question is now visible on the live site rather than sitting in the data: either a name goes alongside it or it stays as the sheet has it. | nothing — the bullet is the sheet's own wording | open |
| 7 | ~~OneDrive syncing node_modules.~~ Closed 2026-08-14: path is local, not synced. The one `EPERM` was a transient lock and hasn't recurred. | — | done |
| 8 | **Typeface is a stand-in.** Inter Variable is the closest open-licence match to the Helvetica-like grotesque in her sheets, but it isn't it. A licensed face (Neue Haas Grotesk, Helvetica Now) would be a closer match and costs money — a decision for Lea, not a technical one. Swapping is one `@font-face` block; see `src/assets/fonts/README.md`. | nothing — deferred | open |
| 9 | **No written copy per project.** Every project page is metadata, role bullets and images — there is no description, because the PDF has none and inventing one breaks the tone rules. Two or three factual sentences per project from Lea (the brief, the constraint, what the space had to do) would lift the detail pages considerably. Since step 7 the template **already renders the markdown body** through `.rich-text` when there is one, so this is a pure content drop: type the sentences under the frontmatter and they appear under the hero. | nothing — pages work without it | open |
| 10 | **Which projects lead.** Re-picked in step 5 by looking at all 17 heroes: **AD villa, DIFC apartment, K1 villa, AZ triplex, Qatar villa, B11 apartment**, in portfolio order. Chosen for the strength of the photograph and a spread of country, studio and type — not floor area, which is what the first pass used. Separately, **3B apartment leads the home page** with the site's sharpest crop and is deliberately not in the six. Lea should confirm both. One `featured` flag per file, plus `LEAD` in `src/pages/index.astro`. | nothing — the page ships | open |
| 11 | **Which photo leads each project.** The hero is one deliberate pick per project, in `HERO` in `scripts/crop-sheets.mjs` — chosen for being a perspective render of the main space rather than by size. Lea should confirm all 17. One line each to change, then re-run the script. | nothing — heroes work | open |
| 12 | **A studio mark is burned into one image.** 3BF apartment's bathroom (`gallery-05.jpg`) carries a small "Design in Frame" logo in the pixels. Unlike the DIFC watermark there's no clean twin to fall back on, and it's the studio she did the work for, so it reads as a credit rather than a mistake — but it's the only image on the site carrying one. Either Lea supplies the unmarked original (open item 1 would cover it) or the image goes. | nothing — it renders fine | open |
| 13 | **`robots.txt` currently blocks every crawler.** Deliberate — step 10 was pulled forward, so the site is live at Lea's permanent URL while `/work` is still a scaffold and `/about` and `/contact` are stubs. `public/robots.txt` must be replaced with a real one at step 9, or the finished site is never indexed. The file says so in a comment of its own. | Step 9 must not close without this | open |
| 14 | **Repo access.** The repo is on Lea's account by design (decision 2026-08-14), so she has to create it and add the maintainer as a collaborator before anything can be pushed. If she'd rather not add a collaborator, the alternatives are a deploy key or working from a fork — both worse. | Step 10's push | open |

---

## Source material

`src/assets/sheets/` holds the 23 portfolio pages extracted from the source PDF,
named by sheet number and project. These are **full-page composites** (text +
4–6 photos each) at ~2475×1239, not usable directly — step 4 crops the individual
photos out of them.

The PDF cover and back cover are **deliberately absent**: Lea's phone number is
part of the image, and pixels can't be gitignored. Do not re-extract them.

Everything else from the PDF — every project's metadata and role bullets — is
already written out in `docs/BRIEF.md`. **Never reopen the source PDF.**

---

## Steps

### 1. Scaffold — `done`

**Goal:** a running Astro project with the toolchain wired up.

**Outcome:** Astro 5 + Tailwind 4 (`@tailwindcss/vite`) + GSAP/ScrollTrigger +
Lenis installed. `src/scripts/motion.ts` has smooth scroll and a `[data-reveal]`
helper, both no-op under `prefers-reduced-motion`. First-pass tokens in
`src/styles/global.css`. Placeholder home page renders. `.gitignore` excludes
`*.pdf`/`*.docx` from the first commit onward. `CLAUDE.md` and `docs/BRIEF.md`
written. 23 portfolio sheets extracted to `src/assets/sheets/`.

**Verified:** `npm run build` passes, 0 errors / 0 warnings. Tailwind emits
8.2 KB of CSS with all design tokens present.

**Gotcha hit and fixed:** npm installed two copies of Vite (8 for
`@tailwindcss/vite`, 6 for Astro), which failed `astro check` on incompatible
Plugin types even though the build itself worked. Solved with the `overrides`
entry in package.json. If Vite type errors reappear, run `npm ls vite --all`.

---

### 2. Design system — `done`

**Goal:** every visual primitive, proven on one page, before any real page exists.

**Task:**
- Finalise design tokens in `src/styles/global.css` from the visual identity in
  `docs/BRIEF.md` §2 — paper/ground/ink/muted, type scale, spacing, hairline rule.
- Self-host a grotesque typeface matching her layouts. No CDN, no external fetch.
- Build layout primitives as Astro components: `Container`, `Section`, `Grid`,
  and the signature left vertical rule with vertical label.
- Build motion primitives on `src/scripts/motion.ts`: heading mask reveal, image
  scale-in, grid stagger. Follow the motion language in `docs/BRIEF.md` §2 —
  slow and weighted, no bounce. Each must no-op under `prefers-reduced-motion`.
- Build a `/styleguide` page rendering every token, primitive and motion effect.

**Done when:** `/styleguide` shows the full system, `npm run build` passes.

**Outcome:** the whole system exists and is rendered at `/styleguide`
(noindex, not linked from the site).

- **Tokens** — `src/styles/global.css`: 6 colours, a fluid type scale with
  weight baked into each step (display and headline bold, title light — that
  contrast is the identity), 5 spacing tokens, 3 measures, 2 easings. Declared
  `@theme static` so every token stays in `:root` even before a utility uses
  one; the styleguide reads its printed values back out of the live computed
  styles, so it can't drift from the CSS.
- **Typeface** — Inter Variable, latin subset, self-hosted from
  `src/assets/fonts/` with its OFL licence. 48 KB for weights 100–900. See
  open item 8.
- **Primitives** — `Section`, `Container`, `Grid`, `VerticalRule` in
  `src/components/`. Section owns vertical rhythm and the signature left rule
  with vertical label; Container owns the horizontal bound and gutters; Grid
  does even n-ups plus the raw 12-column grid for her ⅓ text / ⅔ image split.
- **Motion** — `src/scripts/motion.ts`: fade-and-rise, heading line mask
  reveal (SplitText, re-splits on resize and font load), image scale 1.06 → 1,
  grid stagger at 70ms, and scroll-linked parallax. All opt-in by data
  attribute, all no-op under `prefers-reduced-motion`, and nothing is left
  invisible when they do — CSS hides pre-animation states only behind a
  `.motion` class that JS adds, with a 2s failsafe timer plus a try/catch that
  clears inline styles if init throws part-way.
- The placeholder home page was rebuilt on these primitives and links to
  `/styleguide`.

**Verified:** `npm run build` — 0 errors, 0 warnings, 0 hints. Dev server
serves both pages. Built HTML carries every reveal attribute, all 8 images have
meaningful alt text and explicit dimensions (no CLS), and the font is emitted
to `dist/_astro/` with a hashed name. CSS 17.5 KB, JS 54 KB gzipped
(GSAP + ScrollTrigger + SplitText + Lenis) — worth watching at step 9's
Lighthouse run, since that is the whole JS budget.

**Not verified:** the animations were not watched running.

> Corrected 2026-08-15 (step 4b): the reason given here — "this environment has
> no browser" — was wrong. Chrome and Edge are both installed; nobody had
> looked. `scripts/shoot.mjs` now screenshots and measures any route, and
> `--reduced` confirmed nothing is left invisible under reduced motion. What is
> still outstanding is narrower than this line claimed: watching the tweens
> actually play.

---

### 3. Content model — `done`

**Goal:** all 17 projects as data, so no project page is ever hand-written.

**Task:**
- Define the Astro content collection schema for projects. Fields: title, slug,
  studio, rooms covered, area, location, country, city, type, status, role
  bullets, sheet reference, image fields.
- Create an entry for every project in `docs/BRIEF.md` §4.
- Model the facets in `docs/BRIEF.md` §5 so `/work` can filter on them later.
- Render a bare unstyled `/work` list proving all 17 load and the schema
  type-checks. Placeholder images are fine at this stage.

**Done when:** 17 entries exist, `astro check` passes, the bare list renders.

**Outcome:** all 17 projects are data. Three files plus the content directory:

- **`src/lib/facets.ts`** — the controlled vocabularies from `docs/BRIEF.md` §5
  (type, status, country, city, studio) with their display labels. The schema
  builds its zod enums from these arrays, so a typo in frontmatter fails the
  build rather than quietly creating an 18th filter option. Deliberately
  import-free, since `content.config.ts` can't drag `astro:content` in with it.
- **`src/content.config.ts`** — the schema. A project carries title, studio,
  type, status, city / district / development, optional whole-project area, a
  `featured` flag, and a non-empty `sections` array. Each section is one source
  sheet: rooms covered, its own area and status where they differ, the sheet
  number, and its role bullets. `hero` and `gallery` use `image()` and are
  optional until step 4 crops them — paths are `<slug>/<role>`, so the swap to
  Lea's originals is a file drop.
- **`src/lib/projects.ts`** — everything pages ask of the data:
  `getProjects()` (portfolio order), `getFeaturedProjects()`, and the derived
  values `countryOf` / `locationOf` / `placeOf` / `areaOf` / `areaLabel` /
  `roomsOf` / `rolesOf` / `sheetsOf`, plus `facetsOf()` which returns the four
  filter groups with counts, in vocabulary order, empty options dropped.
- **`src/content/projects/*.md`** — 17 files, one per slug, frontmatter only.

`/work` is a deliberately unstyled scaffold (noindex) printing every derived
field for all 17 — step 6 replaces it wholesale. It exists so a wrong area sum
or an unmapped city surfaces now rather than inside the real grid.

**Verified:** `npm run build` — 0 errors, 0 warnings, 0 hints; content synced,
3 pages built. Read back out of `dist/work/index.html`: 17 projects in sheet
order 2 → 24, 6 featured. Facet counts total 17 in all four groups — type
(villas 5 · apartments 8 · triplex 1 · studio 1 · chalet 1 · house 1), location
(UAE 5 · Qatar 1 · Lebanon 11), status (completed 12 · under construction 5),
studio (Step Into Detail 5 · Design in Frame 12). Derived areas are right where
the brief gives no project total: AD villa 120 m² (70 + 50), VBM villa 250 m²
(150 + 100). Location lines resolve correctly through district and development
— "Ashrafieh, Beirut, Lebanon — Sursock Yards".

**Note:** the image fields were in place but empty when this step closed —
step 4 filled all 17 in.

---

### 4. Image pipeline — `done`

**Goal:** real images on the page, croppable now and replaceable later.

**Task:**
- Crop the individual photos out of the sheet composites in `src/assets/sheets/`
  into `src/assets/projects/<slug>/`. Each sheet holds 4–6 photos in a grid plus
  a small thumbnail; the left third is text and must not be included.
- **Design for replacement.** Content entries reference images by slug and role
  (`hero`, `gallery`), never by sheet number or crop coordinates, so swapping in
  Lea's originals later is a file drop, not a refactor. Record the crop script so
  it can be re-run.
- Wire images through `astro:assets` `<Image>`/`<Picture>` with responsive
  AVIF/WebP. Explicit aspect-ratio boxes so nothing shifts while loading;
  lazy-load below the fold.
- Write meaningful alt text describing each space, not the filename.
- Document "how to add or replace a project image" in `CLAUDE.md`.

**Constraint:** crops land around 600–900 px wide. Fine for grid cards, soft for
full-bleed heroes — so design the hero around a 2:1 crop of the single strongest
image per project rather than a full-viewport bleed. Revisit if open item 1 lands.

**Done when:** real images render, `dist/` contains responsive variants, no CLS.

**Outcome:** real images render, through one component, with hand-written alt
text on every one.

- **`scripts/crop-sheets.mjs`** — the crop pipeline, re-runnable with
  `node scripts/crop-sheets.mjs` (`--dry-run` reports without writing). It
  finds the photos on a sheet by recursive **XY-cut** — trim a region to its
  ink, split it on the widest run of white crossing it, recurse — so there are
  no hand-measured crop coordinates to rot. Node + sharp, because Astro already
  depends on sharp: re-running needs no install beyond `npm install`.
- Two things the cut can't decide for itself are explicit config in that file,
  matched **by box overlap rather than index** so a tweak to the detector can't
  silently drop the wrong thing: `DROP` (detections that aren't photographs)
  and `HERO` (which photo leads a project).
- **130 crops** in `src/assets/projects/<slug>/` as `hero.jpg` and
  `gallery-NN.jpg` — 17 directories, plus a `manifest.json` of every crop's
  source sheet, box and dimensions. Names carry slug and role only, so swapping
  in Lea's originals (open item 1) is a file drop.
- Heroes are a centred 2:1 crop of the chosen photo, 539–1314 px wide. The
  hero's photo also stays in the gallery, so the detail page doesn't show a gap
  where the image the viewer just saw should be.
- **8 detections dropped**, taking 138 → 130: four elevation drawings (DIFC
  sheets 5 and 6, FG villa's sheet 8), two text-column reprints (8B2, MN), one
  near-identical repeat (MMA's two renders of the same view differing only in
  whether the TV is on the wall), and sheet 6's watermarked door render.
- **All 17 content files carry `hero` and `gallery`** with hand-written alt
  text — 130 descriptions of the space, not the filename.
- **`src/components/Media.astro`** — the one place a picture reaches the
  browser. Emits AVIF + WebP + a JPEG fallback across a width ladder capped at
  the source width, inside a `.media` box carrying an explicit `aspect-ratio`,
  lazy by default with a `priority` opt-out for above the fold. It also owns the
  reveal wiring, so a page can't forget it: `reveal` defaults on, off when
  `parallax` is set (both animate the same element), and `reveal={false}` inside
  a staggered `Grid`.
- Two supporting fixes `<Picture>` forced, both in `global.css`: `.media` now
  sizes the `picture` wrapper as well as the `img` (an inline wrapper of auto
  height gives the img no percentage to resolve against), and the pre-animation
  rule hides the **direct child only** — hiding both `picture` and `img` would
  have left the image at `opacity: 0` after GSAP faded the wrapper in.
- The styleguide documents `Media` alongside the other primitives, and its image
  demos now use real project crops rather than the sheet composites.
- `CLAUDE.md` has an **"Adding or replacing a project image"** section covering
  the three cases: overwrite one file, add one to a gallery, or drop in a whole
  project's originals.

**Verified:** `npm run build` — 0 errors, 0 warnings, 0 hints; `astro check`
clean across 16 files. Read back out of the built HTML: 28 rendered images, all
28 with non-empty alt text and explicit `width`/`height`, all 28 lazy, all 28
offering AVIF and WebP with a JPEG fallback. Zero `.media` boxes without an
aspect ratio and zero bare `/public` image paths, so there is no CLS path. The
variant ladder does cap at source width — a 768px hero emits 400/600/768 and
nothing above it.

**Build cost:** 237 image variants in 11.7s of sharp work, 17s total build for 3
pages. That is 28 source images; steps 6 and 7 will render all 130, so expect
roughly 1,100 variants and a minute or so of image work. Worth watching but not
worth pre-optimising — GitHub Actions builds this once per push.

**Correction to what step 4 assumed:** the previous session expected ~20
text-column thumbnails to be lower-res duplicates. They mostly aren't. Only two
were true reprints; the rest are distinct photographs that appear nowhere else,
and dropping them would have cost real content. What the text column actually
hides is *drawings* — DIFC sheets 5 and 6 put washed-out elevations there, the
same category as the sheet 7 line drawings already found. Checking was cheap:
comparing a normalised greyscale signature of every crop against its project's
others separated the exact reprints (0.99+) from the merely similar (≤0.67) in
one pass, and only the survivors needed eyeballing.

**Not verified:** the animations still haven't been watched running.

> Corrected 2026-08-15 (step 4b): "no browser in this environment" was wrong —
> see the same correction under step 2. Still worth a human pass on
> `/styleguide`: that the `Media` boxes reveal, and that the parallax demo
> drifts without exposing an edge.

---

### 4b. Site chrome — `done`

> Numbered `4b` rather than renumbering 5–11, which are referenced by number in
> the open items table and in `CLAUDE.md`. Order in this file is what drives the
> work, not the numbering.

**Goal:** the header, footer and skip link every page inherits — built once in
`BaseLayout`, before the pages that assume they exist.

**Task:**
- Header in `BaseLayout`: her name as the home link, nav to Work / About /
  Contact. Built from step 2 primitives; if something is missing, add it to the
  design system rather than styling the header one-off.
- Mark the current page with `aria-current="page"`.
- **Mobile nav must work with JavaScript off** — either links that stay visible
  at 375px, or a CSS-only disclosure. If it opens as an overlay: focus trapped,
  Escape closes, focus returns to the toggle.
- Skip-to-content link, off-screen until focused.
- Footer: name, title, and a contact link. No phone, no address, no socials —
  see the hard rules in `CLAUDE.md`. The assembled-in-JS email itself is step 8;
  until then the footer links to the contact route.
- Decide whether the header sticks, hides on scroll down, or just scrolls away.
  Whatever it does must no-op under `prefers-reduced-motion`.
- Nav links to `/contact` as its own route, per `docs/BRIEF.md` §3. Step 8's
  wording ("the contact section") is looser — if it lands as a section on
  `/about` instead, update the nav link there.

**Done when:** every page has header and footer, nav works at 375 / 768 /
1440 px, is keyboard-navigable with visible focus, works with JS off, and
respects reduced motion.

**Outcome:** every page inherits its chrome from `BaseLayout`, and none of it
needs JavaScript.

- **`BaseLayout` owns the landmarks** — skip link, `SiteHeader`,
  `<main id="main" tabindex="-1">`, `SiteFooter`. A page supplies the content of
  main, never the element, so `#main` is always there to skip to. `body` is a
  min-height column with main growing, which keeps the footer at the bottom of
  a short page instead of floating up it. The three existing pages lost their
  own `<main>` wrappers.
- **`src/components/SiteHeader.astro`** — her name as the home link, then Work /
  About / Contact. No toggle, no overlay, no menu state: three links stay
  visible at 375px, so there is no focus trap or Escape handler to get wrong
  and nothing here breaks with JS off. Sticky, opaque, with a hairline under it.
- **`src/components/SiteFooter.astro`** — name, title, the routes, and the
  copyright. Built on `Section`, so it carries the same rule and vertical label
  as every other band; that label is the location, as on her sheets. No phone,
  no address, no socials.
- **`src/lib/nav.ts`** — the one route list both read, plus `currentFor()`,
  which returns `page` for the exact route and `true` for an ancestor so
  `/work/<slug>` will keep Work lit in step 7. Styling selects on that same
  attribute rather than a class of its own.
- **New tokens** `--spacing-header` and `--spacing-tap`, and the component
  classes `.nav-link`, `.skip-link` and `.first-screen`, all in `global.css`
  and all documented in a new **Chrome** section on `/styleguide`. `:target`
  gets `scroll-margin-top` so the sticky header can't cover anything reached by
  a hash link.
- **`/about` and `/contact` exist as noindex stubs** so no nav link 404s. Step 8
  replaces both; the contact stub deliberately carries no address.
- **`scripts/shoot.mjs`** — screenshots and measures any route at any width
  through the DevTools Protocol. See the Commands section of `CLAUDE.md`.

**Verified:** `npm run build` — 0 errors, 0 warnings, 0 hints; `astro check`
clean across 22 files. Read back out of the built HTML: all 5 pages carry
header, `main#main`, footer and skip link, exactly one `aria-current` per nav
per page, every internal href resolves to a built page, and a scan of `dist/`
finds no email, phone number or social handle.

Measured in Chrome at 375 / 768 / 1440 across all four routes, and again with
JavaScript disabled and again under `prefers-reduced-motion` — 36 runs, no
failures. No page scrolls sideways at any width; the header row fits at 375px
with 274px of content in 335px of room; every nav link is a 44px pointer
target; `getBoundingClientRect().top === 0` after scrolling 1400px on `/work`,
so the header really does stick. With JS off and under reduced motion, zero
reveal targets are left at `opacity: 0` — the visibility contract holds. Seen
by eye: the skip link appears on focus and nothing else moves, the current page
is underlined in both header and footer, and the footer stacks at 375px.

**Not verified:** the animations still haven't been watched *in motion* — a
screenshot after settle shows the end state, not the heading line masks
playing or the parallax drifting. That needs a human at `npm run dev` or a
video capture. What is now verified is the thing that actually mattered: that
nothing is ever left stuck invisible.

---

### 10. Go live — `done`

> **Pulled forward from the end of the list on 2026-08-15** so the remaining
> pages are built against a live URL instead of only `localhost`. Kept as number
> 10 rather than renumbered: the open items table and `CLAUDE.md` reference these
> numbers, and order in this file is what drives the work.

> **Human step:** create an empty repo in the browser at `github.com/leakassem`,
> named **exactly** `leakassem.github.io`, or Pages won't serve it at the root.
> The `gh` CLI isn't installed and isn't worth installing.

**Task:**
- `site` and `base` in `astro.config.mjs` are already set for this — confirm them
- Add the GitHub Actions workflow to build and deploy to Pages
- Confirm `.gitignore` still excludes the PDF and CV, and check nothing sensitive
  is staged before the first commit
- Commit, push, and tell the user exactly what to click in the repo settings

**Done when:** the site is live and the workflow deploys on push to `main`.

**Outcome: the site is live at https://leakassem.github.io**, deployed from
`leakassem/leakassem.github.io` by GitHub Actions on every push to `main`.

- **`.github/workflows/deploy.yml`** — build on push to `main` plus manual
  `workflow_dispatch`, then deploy to Pages. Written out rather than using
  `withastro/action` so CI runs the same `npm run build` as the dev machine,
  `astro check` included: a type error or a broken image reference fails the
  deploy instead of shipping. `concurrency: pages` with `cancel-in-progress`, so
  a push landing mid-deploy supersedes the older run rather than racing it.
  Node pinned to 24 to match local.
- **`astro.config.mjs` confirmed unchanged** — `site: 'https://leakassem.github.io'`,
  `base: '/'`. Both are already correct for a user site, which is the whole
  reason the repo name has to be exact.
- **`public/robots.txt` — a temporary disallow-all.** The site goes live at Lea's
  permanent URL while the home page is still a placeholder and `/work` is still a
  scaffold. Step 9 must replace it; tracked as open item 13 so it can't be
  forgotten.
- **`.gitattributes`** — `* text=auto eol=lf` plus binary rules for jpg/png/woff2.
  The dev machine is Windows and CI is Linux; without this the first Linux
  checkout can show whole files as changed.
- **`.claude/settings.local.json` is now gitignored** — a machine-local
  permission allowlist, not shared project config.

**Verified before committing:** 207 files staged, **zero** matching
`*.pdf` / `*.docx` / `*.doc`. `git check-ignore -v` names the rule catching each
of the two real source documents — `.gitignore:4` for the portfolio PDF,
`.gitignore:5` for the CV. Repo is 16.2 MB (10.3 project crops, 5.5 sheets), so
no LFS. `npm run build` passes — 5 pages, 237 image variants — `dist/robots.txt`
ships, and a scan of every built `.html`/`.js`/`.css` finds no email address, no
phone number and no social handle.

**Verified live** on 2026-08-16, after the push: `/`, `/work/`, `/styleguide/`,
`/robots.txt` and `/favicon.svg` all return 200. The hashed CSS bundle and an
AVIF hero variant both serve from `/_astro/`, so Pages is serving the built
asset graph and not just the HTML. `robots.txt` is the disallow-all it should be.
The served HTML carries no email address and no phone number. `main` is in sync
with `origin/main` with a clean tree.

**What this changes for every step after it:** a step is not finished until it is
pushed. `git push` is the deploy, and a red run in the Actions tab means nothing
was published — the previous version stays live, which is a safe failure but a
silent one.

---

### 5. Home page — `done`

**Goal:** the signature page. This is where the animation budget goes.

**Task:** hero, selected work (the 5–6 strongest projects), a short about teaser,
a contact CTA. Invest in the hero and scroll choreography — this page carries the
whole impression. Use only step 2's primitives; if something is missing, add it
to the design system rather than one-off styling here.

**Done when:** complete and responsive at 375 / 768 / 1440 px, reduced-motion verified.

**Outcome:** the home page is real — four bands, built from step 2's primitives,
with one new shared component and two new component classes.

- **First screen** — her cover sheet rearranged for a screen: the white card on
  the grey ground, the rule with `PORTFOLIO` set vertically, her name at display
  size, and the standfirst resting on the same bottom edge once there is room
  for it. The photograph is a band across the foot of the card, drifting on
  `data-parallax`. Exactly one viewport tall from 64rem up.
- **Selected work** — the six featured projects as a staggered 2-up grid, with
  the count, and `All work` beside it.
- **About teaser** — the scope statement, the bio paragraph from
  `docs/BRIEF.md` §1, and three figures counted from the project data at build
  time (17 projects · 3 countries · 3,072 m²), so no figure here can contradict
  the work index.
- **Contact** — heading, one line, and a link to `/contact`. The address itself
  is step 8's, assembled in JS.
- **`src/components/ProjectCard.astro`** — hero image at 2:1, place, title, then
  type, area and status. Everything it prints comes through a helper in
  `src/lib/projects.ts`, so it can't assemble a location differently from the
  detail page, and the whole card is the anchor. `/work` renders the same
  component in step 6.
- **`src/lib/projects.ts`** gains `hrefOf()` (one line for step 7 to change) and
  `totalAreaOf()`.
- **`global.css`** gains `.link-rule` and `.project-card`, both documented in a
  new **Components** section on `/styleguide` alongside a real card.

**Verified:** `npm run build` — 0 errors, 0 warnings, 0 hints; `astro check`
clean across 23 files. Read back out of `dist/index.html`: one `h1`, three `h2`,
six project `h3` in portfolio order; 7 images, all with alt text and explicit
width/height, 6 lazy and the hero eager; AVIF and WebP on every one; every
internal href resolves to a page that exists.

Measured in Chrome at 375 / 768 / 1440, then again with JavaScript disabled and
again under `prefers-reduced-motion` — 36 runs, no failures, `hidden=0`
throughout, so the visibility contract holds. Nothing overflows at any width.
Looked at: the hero at all three widths and the whole page end to end.

**Three sizing bugs the screenshots caught**, none of which the build would have:

1. `Media`'s inline `aspect-ratio` resolves the *width* from the height when the
   height is given and the width is auto. A full-height column made the hero
   1062px wide inside a 766px slot, with the card's `overflow` quietly cropping
   the difference.
2. SplitText sets every line it makes to `white-space: nowrap`, and a flex or
   grid item's default `min-width: auto` refuses to shrink below that — one
   heading line dragged the card 37px past the space it had. `min-w-0`.
3. A `1fr` row can only take "whatever the text leaves" against a *definite*
   height. Against `.first-screen`'s min-height it fell back to the image's own
   2:1 height and pushed the card 371px past the viewport.

**Note for the step 8 and 9 privacy scans:** a grep of `dist/` for an email
address matches `jack@greensock.com` — GSAP's licence header inside the vendor
bundle, which has shipped since step 2. It is not Lea's data. Scope those
checks to the pages, or expect that one hit.

**Not verified:** the animations still haven't been watched *in motion* — the
screenshots are taken after everything has settled, so they show end states.

---

### 6. Work index — `done`

**Task:** build `/work` — the full project grid, filterable by type, location and
status (facets in `docs/BRIEF.md` §5). Filtering must work without JavaScript as
a baseline, enhanced with client-side JS. Staggered grid entrance animation.

**Done when:** all 17 projects listed, filters work both JS-off and JS-on.

**Outcome:** `/work` is the real index — all 17 projects as a staggered 3-up
grid, filterable by type, location and status, **and the filtering is CSS**.

- **Three radio groups, one generated rule per option.** Checking a chip makes
  `.work:has(#f-type-villa:checked) .work-card:not([data-type="villa"])` apply,
  which hides everything else. The groups combine because each rule hides
  independently. `type="reset"` on the form clears all three. None of that is
  JavaScript, so none of it can fail to load, and there is no toggle state to
  get wrong.
- **The empty state is generated too.** 41 of the 84 combinations match nothing
  — there are no villas in Lebanon and no apartments in Qatar — so the page
  computes the empty ones from the content and emits selectors for them.
  Enumerating the empty *pairs* first and then only the triples they don't
  already cover brings 41 down to 16 selectors.
- **The script is enhancement only:** it mirrors the selection into the query
  string so a filtered view can be linked or bookmarked, restores it on load,
  and announces "Showing 5 of 17 projects" through `aria-live`. Nothing it does
  is load-bearing, and it reads the vocabulary out of the DOM rather than
  holding a second copy of it.
- **`ProjectCard` gained a `headingLevel` prop**, so the card fits the page's
  outline rather than the page fitting the card — `h2` here under the single
  `h1`, `h3` on the home page under "Selected work".
- **New in the design system:** `.filter-input`, `.chip`, `.chip-count` and
  `.work-empty`, all rendered on `/styleguide` under **Components**.
- The step-3 scaffold is gone, and so is its `noindex` — `/work` is a real page
  now. `public/robots.txt` still covers the site until step 9.

**Verified:** `npm run build` — 0 errors, 0 warnings, 0 hints. Built HTML: 17
cards, 14 radios, 11 hide rules, 16 empty-state selectors, one `h1` and 17 `h2`,
every image with alt text.

**Driven in Chrome with real mouse clicks and JavaScript execution disabled**,
which is the only way to prove the baseline: unfiltered 17 → villas 5 → plus UAE
4 → plus completed 3; villas + Lebanon shows 0 **and the empty state appears**;
apartments + Lebanon + completed 5; reset restores all 17 and leaves only the
three "all" options checked. The same eleven checks pass with JavaScript on, and
with it the query string mirrors the selection and `/work?type=villa&status=completed`
restores its filters on load.

**Keyboard:** tab order is skip link → wordmark → three nav links → one stop per
radio group, focus lands on screen rather than scrolling away, arrow keys move
within a group and filter as they go, and the focus ring lands on the chip
rather than on the 1px input behind it.

Measured at 375 / 768 / 1440, with JS off and under reduced motion: no overflow,
nothing hidden.

**A bug in the chip pattern, caught by asking where focus goes:** the clipped
radios are `position: absolute` with nothing positioned above them, so all 14
stacked at the top-left of the document — tabbing to a filter would have
scrolled the page away from the filter. Their row is `relative` now.

**`CLAUDE.md` corrected:** in Git Bash a route argument like `/work` is rewritten
to `C:/Program Files/Git/work` before Node sees it, so `scripts/shoot.mjs`
silently shoots every default route instead of the one asked for. Needs
`MSYS_NO_PATHCONV=1`.

---

### 7. Project detail — `done`

**Task:** build `/work/[slug]` — hero image, metadata block (area / location /
status / type), role list, and an image gallery with a keyboard-accessible
lightbox. Add Astro view transitions from the work index so the hero feels
continuous.

**Done when:** all 17 detail pages generate, lightbox is keyboard-navigable.

**Outcome:** all 17 project pages exist, from one template, and the site now
navigates as one piece rather than as a set of documents.

- **`src/pages/work/[slug].astro`** — four bands on step 2's primitives:
  the project (place, title, metadata rows, hero at 2:1), the role, the gallery,
  and the next project. `src/pages/work.astro` moved to `work/index.astro` so
  the section is one directory.
- **The role is one block per source sheet.** AD villa reads as "Reception area
  · 70 m²" and "Media room, guest bedroom & home office · 50 m²", each with its
  own bullets; Qatar villa's outdoor carries its own *under construction*
  against a *completed* interior. `scopesOf()` in `src/lib/projects.ts` is the
  one place that assembles it, and it replaced `roomsOf`/`rolesOf`, which were
  built in step 3 for this and would have said the same thing twice.
- **The metadata block is `.rule-list`** — hairline rows, term beside value
  once the column is wide enough for two, stacked below 30rem. Rows whose fact
  the brief never states are absent, so the list is a different length per
  project rather than padded with guesses. `Development` appears only on the
  four projects that have one; `Area` only where a sheet stated one.
- **The gallery is a tight 3-up seam grid at 4:3**, and every tile is a **link
  to its image file**. With JavaScript off that is the whole feature — the
  photograph opens at full size. With it, a script shows the same file in a
  native `<dialog>`: `showModal()` is where the focus trap and Escape come
  from, so what is actually written here is which image is showing, arrow keys,
  a counter, the backdrop click, and returning focus to the tile.
- **`setScrollLocked()`** in `motion.ts` holds the page still behind the
  lightbox. `overflow: hidden` alone isn't enough while Lenis is scrolling the
  page itself, and Lenis is that module's business, not a page's.
- **View transitions, site-wide.** `ClientRouter` in `BaseLayout`, and a
  project's hero carries the same `view-transition-name` on the card and on the
  page it opens — so the photograph moves into place instead of the page
  cross-fading. `transitionNameOf()` derives it at both ends.
- **`hrefOf()` now returns `/work/<slug>`** — the one line step 5 left for this,
  which is why no page had to change to get its links.
- **New in the design system:** `.rule-list` / `.rule-list-split`,
  `.gallery-item`, the `.lightbox` family, and `.rich-text`. All rendered on
  `/styleguide` under **Components**.
- **`.rich-text` renders a project's markdown body when there is one.** Every
  body is still empty — open item 9 — so the block is conditional. It exists so
  that copy from Lea is a content drop and not a template change.
- **`scripts/shoot.mjs` gained `--full`**, which captures past the viewport
  after forcing every lazy image to load. Its no-alt check now exempts an
  `<img>` with no source at all, which is what the lightbox ships until it is
  opened.

**Verified:** `npm run build` — 0 errors, 0 warnings, 0 hints; `astro check`
clean across 24 files. 22 pages built. Read back out of the built HTML: all 17
detail pages present, every internal href across all 22 pages resolves to a page
that exists, every rendered image has alt text, no page has two elements
claiming the same `view-transition-name` (17 on `/work`, 6 on home, 2 on a
detail page).

**Measured in Chrome at 375 / 768 / 1440 across all 22 routes**, then again with
JavaScript disabled and again under `prefers-reduced-motion` — 198 shots, no
failures, `hidden=0` throughout both baselines. Nothing scrolls sideways at any
width.

**Driven in Chrome with real clicks and keystrokes** — 36 checks, all passing.
The gallery lays out in three columns with every image loading; a click opens
the dialog as a true modal with the page behind locked; the counter tracks;
ArrowLeft/ArrowRight step and wrap; the enlarged image fits the viewport whole;
Escape closes, releases the lock and returns focus to the tile that opened it;
Enter on a focused tile opens it; and Tab never reaches anything behind the
modal. With JavaScript execution disabled the tiles are still links, the dialog
stays `display: none`, and the link a tile points at returns HTTP 200.

**Three bugs the browser found and the build could not:**

1. **The back button was broken on `/work`.** Its filter script called
   `history.replaceState(null, …)` to mirror the selection into the query
   string, which wiped the router's own history state — so a popstate arrived
   carrying nothing and the router treated it as not its to handle. The URL
   changed and the document didn't. Passing `history.state` through fixes it.
   Nothing about this is visible in the build, in the markup, or in a
   screenshot; it needed a real back navigation.
2. **Motion died after the first client-side navigation.** The `.motion` class
   that gates every pre-animation state is added at runtime and lives on
   `<html>`, and the swap copies root attributes off the incoming document —
   taking it with them. Every page after the first arrived with nothing hidden
   and therefore nothing to reveal. Content was visible, which is the safe
   failure, but it was the whole design gone silently. `armMotionGate()` puts
   the class on the incoming document before it lands.
3. **A page script only runs once.** The browser will not re-execute a module
   script it has already run, so `/work`'s filter enhancement and the lightbox
   both stopped working on a second visit. Both now re-run on
   `astro:after-swap`.

Also fixed: `/styleguide` had scrolled sideways by 85px at 375px **since step
2** — its spacing demo puts a 224px column, a swatch up to 128px and a line of
text in one unwrapping row. It was never caught because the default route list
doesn't include it and nothing had run `--all` at 375 before.

**Not verified:** the animations still haven't been watched *in motion* — the
screenshots are taken after everything has settled, and that now includes the
view transition itself, which is only ever a mid-flight state. That a swapped-in
page ends up in exactly the same state as the same page loaded fresh *is*
checked (23 of 43 reveal targets shown, both ways). What nobody has seen is the
hero actually travelling.

---

### 8. About & contact — `todo`

> Check open items 2 and 4 first.

**Task:** build `/about` from `docs/BRIEF.md` §1 — bio, experience timeline,
skills, languages, education. Then the contact section.

**Contact is EMAIL ONLY.** No phone, no address, no social links — see the hard
rules in `CLAUDE.md`. Assemble the address in JS so it isn't plain text in the
HTML, with a sensible non-JS fallback.

**Done when:** both pages complete, and a grep of `dist/` finds no plain-text
email or phone number anywhere. Scope that grep to the pages: the GSAP bundle
carries `jack@greensock.com` in its licence header and always has.

**Outcome:** _(fill in)_

---

### 9. Polish — `todo`

**Task:**
- **Replace `public/robots.txt`** — it is a disallow-all placeholder from step 10
  and blocks every crawler. Open item 13. This step cannot close with it in place
- Meta tags, Open Graph images, sitemap, 404 page, favicon
- Drop the `noindex` from the pages carrying it as a work-in-progress marker
- Keyboard navigation and visible focus states on every interactive element
- Alt text audit — every image, describing the space not the filename
- Reduced-motion audit — every animation, nothing left stuck invisible
- Lighthouse run on the built output

**Done when:** Lighthouse ≥95 across the board, a11y audit clean. Report scores.

**Outcome:** _(fill in)_

---

### 11. Custom domain — `todo` (whenever a domain is bought)

**Task:** CNAME file, the exact DNS records to add at the registrar, enforce
HTTPS, update `site` in `astro.config.mjs`, confirm `base` stays `/`. Tell the
user exactly what to paste where.

**Outcome:** _(fill in)_
