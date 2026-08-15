import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

/*
  Motion primitives. The language is quiet and architectural (docs/BRIEF.md §2):
  slow, weighted, precise — no bounce, no spin, nothing that draws attention to
  itself. Pages opt in with data attributes, never by writing their own tweens:

    data-reveal            fade and rise — the default for any block of content
    data-reveal="heading"  line-by-line mask reveal, for headings
    data-reveal="image"    scale 1.06 → 1 with a fade, inside a .media clip box
    data-reveal="grid"     stagger the direct children (Grid's `stagger` prop)
    data-parallax="10"     slow drift on scroll; hero imagery only, never text

  Every one of them no-ops under prefers-reduced-motion, and nothing is left
  invisible when they do — see the visibility contract below.
*/

/**
 * Shared timings. The CSS half of these lives in the `--ease-*` tokens in
 * global.css; if one changes, change the other.
 */
export const DURATION = { fade: 1.1, line: 1, image: 1.4 } as const;
export const EASE = { quiet: 'power3.out', image: 'power2.out' } as const;
export const STAGGER = { grid: 0.07, line: 0.08 } as const;

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/*
  Visibility contract.

  Pre-animation states are CSS, gated on an `.motion` class that the inline
  script in BaseLayout adds to <html>. Doing it in CSS avoids a flash of
  un-animated content; gating it on a class added by JS means a browser with
  JS off never hides anything in the first place.

  That leaves one hole: JS on, but this bundle fails to load or throws. The
  inline script closes it with a timer that strips `.motion` unless this module
  has set `data-motion-ready`. If that timer wins the race, everything is
  already visible and we skip the entrance animations rather than re-hiding
  content that the reader can see.
*/
const motionAllowed = () =>
  !prefersReducedMotion() &&
  document.documentElement.classList.contains('motion');

/*
  State that outlives a page.

  With view transitions the document is swapped rather than reloaded, so this
  module is only ever evaluated once while `initMotion` runs on every page.
  Lenis and the GSAP ticker callback are therefore created once and kept; the
  ScrollTriggers and SplitTexts belong to the page that made them and are torn
  down before the swap.
*/
let lenis: Lenis | null = null;
let splits: SplitText[] = [];

/**
 * Smooth scroll, wired into ScrollTrigger so scroll-driven timelines stay in
 * sync with Lenis rather than the native scroll position.
 *
 * No-ops entirely under prefers-reduced-motion — smooth scrolling is itself a
 * motion effect and is a common migraine and vestibular trigger.
 *
 * Idempotent: calling it again returns the instance already running, so a
 * client-side navigation doesn't stack a second ticker callback on the first.
 */
export function initSmoothScroll() {
  if (prefersReducedMotion()) return null;
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/**
 * Holds the page still behind something in the top layer — the gallery
 * lightbox is the only caller.
 *
 * `overflow: hidden` alone isn't enough while Lenis is running, because Lenis
 * scrolls the page itself in response to wheel and touch rather than letting
 * the browser do it. Both have to stop, which is why this lives here: Lenis is
 * this module's business and no page should be reaching for the instance.
 *
 * `scrollbar-gutter: stable` in global.css is what stops the lock from
 * shifting the layout sideways.
 */
export function setScrollLocked(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : '';

  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/**
 * Fade and rise. The default reveal, for any block that isn't a heading, an
 * image or a grid.
 */
export function initFadeReveals() {
  const targets = gsap.utils.toArray<HTMLElement>(
    '[data-reveal=""], [data-reveal]:not([data-reveal="heading"]):not([data-reveal="image"]):not([data-reveal="grid"])'
  );

  targets.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: DURATION.fade,
        ease: EASE.quiet,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }
    );
  });
}

/**
 * Line-by-line mask reveal: each line rises out from behind a clip edge.
 *
 * SplitText re-splits on resize and when a webfont finishes loading, so lines
 * stay correct if the text reflows. Returning the tween from onSplit lets GSAP
 * revert it cleanly before each re-split.
 */
export function initHeadingReveals() {
  const targets = gsap.utils.toArray<HTMLElement>('[data-reveal="heading"]');

  targets.forEach((el) => {
    // Kept so the swap can revert them: a SplitText left behind holds on to
    // the DOM it rewrote, and its resize and font listeners outlive the page.
    splits.push(
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        // Keeps the heading a single readable string for screen readers rather
        // than one node per line.
        aria: 'auto',
        onSplit: (self) => {
          // The element itself is hidden until the split exists, so the raw
          // text never flashes before it is wrapped in mask elements.
          gsap.set(el, { opacity: 1 });

          return gsap.from(self.lines, {
            yPercent: 115,
            duration: DURATION.line,
            ease: EASE.quiet,
            stagger: STAGGER.line,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        },
      }),
    );
  });
}

/**
 * Image scale-in. The clip box (`.media`) holds its edge while the image
 * settles from 1.06 to 1, so the frame never moves — only the picture inside.
 */
export function initImageReveals() {
  const boxes = gsap.utils.toArray<HTMLElement>('[data-reveal="image"]');

  boxes.forEach((box) => {
    const target = box.querySelector<HTMLElement>('img, picture, video') ?? box;

    gsap.fromTo(
      target,
      { opacity: 0, scale: 1.06 },
      {
        opacity: 1,
        scale: 1,
        duration: DURATION.image,
        ease: EASE.image,
        scrollTrigger: { trigger: box, start: 'top 88%', once: true },
      }
    );
  });
}

/**
 * Grid stagger — direct children enter one after another.
 *
 * This owns its children's entrance, so don't also mark them
 * `data-reveal="image"`; two tweens on the same opacity fight each other.
 */
export function initGridStagger() {
  const grids = gsap.utils.toArray<HTMLElement>('[data-reveal="grid"]');

  grids.forEach((grid) => {
    const items = Array.from(grid.children) as HTMLElement[];
    if (!items.length) return;

    gsap.fromTo(
      items,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: DURATION.fade,
        ease: EASE.quiet,
        stagger: STAGGER.grid,
        scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
      }
    );
  });
}

/**
 * Slow vertical drift tied to scroll position. Hero imagery only — never body
 * text, which is unreadable while it moves.
 *
 * `data-parallax` carries the strength as a percentage of the element's own
 * height. The element must be taller than its clip box (h-[115%] or so) or the
 * drift will expose an edge.
 */
export function initParallax() {
  const targets = gsap.utils.toArray<HTMLElement>('[data-parallax]');

  targets.forEach((el) => {
    const strength = Number(el.dataset.parallax) || 8;
    const frame = el.parentElement ?? el;

    gsap.fromTo(
      el,
      { yPercent: -strength },
      {
        yPercent: strength,
        ease: 'none',
        scrollTrigger: {
          trigger: frame,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });
}

/**
 * Resolves once webfonts are in, or after `timeout` ms — whichever comes
 * first. Headings are split into lines by measurement, so splitting before the
 * real face has loaded would measure the fallback; waiting forever on a font
 * that never arrives would leave the page hidden.
 */
function whenFontsReady(timeout = 1200): Promise<unknown> {
  if (!document.fonts) return Promise.resolve();

  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => window.setTimeout(resolve, timeout)),
  ]);
}

/**
 * Drops everything belonging to the page being navigated away from.
 *
 * A ScrollTrigger holds a reference to its trigger element and keeps measuring
 * it, and a SplitText keeps the resize and font-load listeners it uses to
 * re-split. Neither is cleaned up by the document swap, so both accumulate over
 * a session — and stale triggers measured against a page that no longer exists
 * will fire the new page's tweens at the wrong scroll positions.
 */
export function teardownMotion() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  splits.forEach((split) => split.revert());
  splits = [];
}

/**
 * Puts the pre-animation gate on a document that is about to be swapped in.
 *
 * `.motion` is added at runtime by the inline script in BaseLayout, so it lives
 * on the live `<html>` and not in any page's HTML — which is deliberate, since
 * a browser with JS off must never hide anything. The cost is that Astro's swap
 * copies root attributes from the incoming document and takes the class off
 * with them. Without this, every navigation after the first would arrive with
 * nothing hidden and therefore nothing to reveal: content visible, which is the
 * safe failure, but no animation for the rest of the session.
 *
 * Arming the incoming document rather than the live one is what avoids a flash
 * — the class is in place before the new content is ever painted.
 *
 * The timer is the same failsafe the inline script uses on a full load: the
 * swap also clears `data-motion-ready`, so if `initMotion` doesn't run after
 * this, the gate comes off and the page is static rather than blank.
 */
export function armMotionGate(newDocument: Document) {
  if (prefersReducedMotion()) return;

  newDocument.documentElement.classList.add('motion');

  window.setTimeout(() => {
    const root = document.documentElement;
    if (!root.dataset.motionReady) root.classList.remove('motion');
  }, 2000);
}

/**
 * Wires up the page currently in the document.
 *
 * Runs once per page rather than once per session: with view transitions the
 * document is swapped without a reload, so this is called again after each one
 * — see the script in `BaseLayout.astro`. Everything it creates is torn down by
 * `teardownMotion` before the next swap; everything that must survive one
 * (Lenis, the ticker) is created by `initSmoothScroll`, which is idempotent.
 */
export function initMotion() {
  const root = document.documentElement;

  // Disarms the inline script's failsafe timer — this module is running.
  root.dataset.motionReady = 'true';

  if (!motionAllowed()) {
    // Drops the class that hides pre-animation states, so everything is
    // visible. Under reduced motion the class was never added at all.
    root.classList.remove('motion');
    return;
  }

  initSmoothScroll();

  whenFontsReady().then(() => {
    try {
      initHeadingReveals();
      initFadeReveals();
      initImageReveals();
      initGridStagger();
      initParallax();

      ScrollTrigger.refresh();
    } catch (error) {
      // Anything that throws part-way through leaves some elements stuck at
      // their pre-animation state. Dropping the class handles the ones CSS
      // hid; clearProps handles the ones GSAP had already set inline, which
      // the class can't reach. An unanimated page beats a blank one.
      root.classList.remove('motion');
      gsap.set('[data-reveal], [data-reveal] *', { clearProps: 'all' });
      console.error('[motion] init failed, reveals disabled', error);
    }
  });
}

/*
  Images that decode late change the page height and move every trigger.
  Registered once, at module scope rather than inside initMotion, because `load`
  fires once per document load while initMotion now runs once per page — inside,
  it would stack a listener per navigation for an event that can never fire
  again.
*/
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
