/**
 * How to reach her — the one place that decides.
 *
 * Contact is email only: no phone number, no home address, no social links.
 * That is a decision by the site owner, and hard rule 2 in `CLAUDE.md`. Which
 * address to publish was open item 2 in `work.md`, settled on 2026-08-16.
 *
 * The address must never reach the built HTML as plain text, so the raw
 * constant below is deliberately not exported — a page renders one of the two
 * encoded forms instead, and both are derived from it, so changing the address
 * changes every form of it.
 */
const EMAIL = 'lea_kassem@hotmail.com';

/**
 * Reversed, then base64 — what `EmailLink.astro` ships and its script turns
 * back into a `mailto:`.
 *
 * Reversed as well as encoded because sweeping a page for base64 and decoding
 * every candidate is a cheap thing for a harvester to do, and plain base64
 * gives up an address in that one step. Reversed first, the step yields
 * `moc.liamtoh@messak_ael`, which matches no email pattern.
 *
 * This defeats a harvester that reads HTML with a regular expression, which is
 * what it is for. Nothing done on the client can defeat one that runs a
 * browser, and this does not pretend to.
 */
export const EMAIL_ENCODED: string = btoa([...EMAIL].reverse().join(''));

/**
 * `lea_kassem [at] hotmail [dot] com` — the fallback for a reader with
 * JavaScript off, who would otherwise have no way to contact her at all.
 *
 * Readable and copyable by a person, and not an address to a regular
 * expression. It only ever renders inside `<noscript>`.
 */
export const EMAIL_SPELLED: string = EMAIL.replace('@', ' [at] ').replace(
  /\./g,
  ' [dot] '
);
