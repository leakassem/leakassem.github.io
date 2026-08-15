# Fonts

`inter-latin-variable.woff2` — Inter Variable, latin subset, weight axis 100–900.

Vendored deliberately: the site must never fetch a font from a CDN, and the file
is small enough (48 KB for the whole weight range) that carrying it beats
carrying an npm dependency that only exists to hand us one file.

**Source:** `@fontsource-variable/inter@5.3.0`, file
`files/inter-latin-wght-normal.woff2`. Upstream is
[rsms/inter](https://github.com/rsms/inter).

**Licence:** SIL Open Font License 1.1 — full text in `LICENSE-inter.txt`.
Redistribution is fine; the licence file must stay next to the font.

## Why latin only

The site is English, with French names in the education line (`École`, `sœurs`,
`Besançon`). Every one of those characters is inside the latin subset — `Œ`/`œ`
are `U+0152-0153`, which Google's latin range includes. `latin-ext` would add
85 KB for characters no copy on this site uses.

## Replacing it

Drop a new `.woff2` in this folder and update the `@font-face` block in
`src/styles/global.css`. It is referenced once, there, and nowhere else — the
rest of the codebase goes through the `--font-display` / `--font-body` tokens.
If the replacement is not variable, the `font-weight: 100 900;` range in that
block has to become the single weight the file actually contains.
